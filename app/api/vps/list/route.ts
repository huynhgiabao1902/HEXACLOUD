import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'

// GET - List all VPS for a user
export async function GET(request: NextRequest) {
  try {
    // Get user_id from query params
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    console.log('📋 Fetching VPS list for user:', user_id)

    // Forward request to backend
    const response = await fetch(`${BACKEND_URL}/vps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Backend error ${response.status}:`, errorText)

      return NextResponse.json({
        success: false,
        error: `Failed to fetch servers: ${response.status}`,
        message: errorText
      }, { status: response.status })
    }

    // Parse response
    const result = await response.json()
    console.log('📦 Backend returned:', result)

    // Filter servers for current user
    if (result.success && Array.isArray(result.data)) {
      // Filter only servers that belong to the current user
      const userServers = result.data.filter((server: any) =>
        server.user_id === user_id || !server.user_id // Include servers without user_id for backward compatibility
      )

      console.log(`✅ Found ${userServers.length} servers for user`)

      return NextResponse.json({
        success: true,
        data: userServers,
        count: userServers.length
      })
    }

    // If backend doesn't return expected format
    return NextResponse.json({
      success: false,
      data: [],
      message: 'Invalid response format from backend'
    })

  } catch (error: any) {
    console.error('❌ GET /api/vps/list error:', error)

    // Check if backend is down
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json({
        success: false,
        error: 'Cannot connect to backend server',
        message: 'Please ensure the backend is running',
        data: []
      }, { status: 503 })
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch servers',
      data: []
    }, { status: 500 })
  }
}