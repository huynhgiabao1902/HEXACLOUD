import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'

// This is an alias for /api/ssh/connect but named 'test' for dashboard compatibility
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    console.log('🔌 Testing SSH connection:', body.host);

    // Validate required fields
    if (!body.host || !body.username || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: host, username, password'
        },
        { status: 400 }
      );
    }

    // Prepare payload for backend
    const backendPayload = {
      host: body.host,
      port: parseInt(body.port?.toString() || '22'),
      username: body.username,
      password: body.password
    };

    console.log('📤 Forwarding to backend:', `${BACKEND_URL}/ssh/connect`);

    // Forward request to backend SSH test endpoint
    const response = await fetch(`${BACKEND_URL}/ssh/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
      signal: AbortSignal.timeout(20000) // 20 seconds timeout
    });

    console.log('📥 Backend response status:', response.status);

    // Get response text first
    const responseText = await response.text();
    console.log('📄 Backend response:', responseText);

    // Parse response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse backend response:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid response from backend SSH test'
      }, { status: 500 });
    }

    // Return the result with appropriate status
    return NextResponse.json(result, {
      status: response.ok ? 200 : response.status
    });

  } catch (error: any) {
    console.error('❌ SSH test error:', error);

    // Handle different error types
    if (error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        error: 'Connection timeout - SSH test took too long',
        message: 'The server did not respond within 20 seconds'
      }, { status: 408 });
    }

    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json({
        success: false,
        error: 'Cannot connect to backend server',
        message: 'Please ensure the backend is running',
        details: `Backend URL: ${BACKEND_URL}`
      }, { status: 503 });
    }

    // Generic error response
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test SSH connection',
      message: 'An unexpected error occurred during SSH test'
    }, { status: 500 });
  }
}