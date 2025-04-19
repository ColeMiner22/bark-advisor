import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // TODO: Implement actual sign up logic here
    // This is a placeholder response
    return NextResponse.json({ 
      success: true,
      message: 'Sign up successful',
      user: { email, name }
    });
  } catch (error) {
    console.error('Sign up API error:', error);
    return NextResponse.json(
      { success: false, message: 'Sign up failed' },
      { status: 500 }
    );
  }
} 