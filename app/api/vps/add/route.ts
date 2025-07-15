import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'

// POST - Add new VPS
export async function POST(request: NextRequest) {
  try {
    // Get user_id from query params
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')

    // Parse request body
    const body = await request.json()
    console.log('➕ Received request to add VPS:', body)

    // Validate user_id
    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required in query params'
      }, { status: 400 })
    }

    // Validate required fields
    if (!body.name || !body.ip_address || !body.username || !body.password) {
      return NextResponse.json({
        success: false,
        error: 'Required fields missing: name, ip_address, username, password'
      }, { status: 400 })
    }

    // Prepare payload for backend - map frontend fields to backend fields
    const backendPayload = {
      user_id: user_id,
      name: body.name,
      host: body.ip_address,        // Backend expects 'host' but we send ip_address
      ip_address: body.ip_address,  // Also send as ip_address for compatibility
      port: parseInt(body.port) || 22,
      username: body.username,
      password: body.password,
      provider: body.provider || 'other',
      region: body.region || '',
      notes: body.notes || '',
      description: body.notes || '', // Backend uses description
      tags: body.tags || [],
      type: 'manual',
      status: 'unknown'
    }

    console.log('📤 Sending to backend:', `${BACKEND_URL}/vps/add`)
    console.log('📦 Payload:', backendPayload)

    // Forward request to Ubuntu backend
    const response = await fetch(`${BACKEND_URL}/vps/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload)
    })

    console.log('📥 Backend response status:', response.status)

    // Get response as text first
    const responseText = await response.text()
    console.log('📄 Backend response:', responseText)

    if (!response.ok) {
      console.error(`❌ Backend error ${response.status}:`, responseText)

      // Try to parse error message
      let errorMessage = `Backend error: ${response.status}`
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        errorMessage = responseText || errorMessage
      }

      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: response.status })
    }

    // Parse successful response
    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Failed to parse backend response:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Invalid response format from backend'
      }, { status: 500 })
    }

    console.log('✅ VPS added successfully:', result)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('❌ POST /api/vps/add error:', error)

    // Check if it's a network error
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json({
        success: false,
        error: 'Cannot connect to backend server. Please ensure the backend is running.',
        details: `Backend URL: ${BACKEND_URL}`
      }, { status: 503 })
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

// GET - Not supported on /add endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'GET method not supported on /add endpoint. Use POST to add VPS.'
  }, { status: 405 })
}