import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'

// DELETE - Delete a VPS
export async function DELETE(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    console.log('🗑️ Delete VPS request:', body)

    // Validate required fields
    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: 'VPS ID is required'
      }, { status: 400 })
    }

    // Build query params for cloud instances
    let queryParams = ''
    if (body.type === 'cloud' && body.zone) {
      queryParams = `?type=cloud&zone=${body.zone}`
    } else if (body.type) {
      queryParams = `?type=${body.type}`
    }

    console.log('📤 Sending DELETE to backend:', `${BACKEND_URL}/vps/${body.id}${queryParams}`)

    // Forward request to backend
    const response = await fetch(`${BACKEND_URL}/vps/${body.id}${queryParams}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Backend response status:', response.status)

    // Get response text
    const responseText = await response.text()
    console.log('📄 Backend response:', responseText)

    if (!response.ok) {
      console.error(`❌ Backend error ${response.status}:`, responseText)

      let errorMessage = `Failed to delete VPS: ${response.status}`
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
      // If response is empty or not JSON, assume success
      result = { success: true, message: 'VPS deleted successfully' }
    }

    console.log('✅ VPS deleted successfully')

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('❌ DELETE /api/vps/delete error:', error)

    // Check if backend is down
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json({
        success: false,
        error: 'Cannot connect to backend server',
        message: 'Please ensure the backend is running'
      }, { status: 503 })
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete VPS'
    }, { status: 500 })
  }
}