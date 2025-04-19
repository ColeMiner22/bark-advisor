// Types for authentication
interface UserCredentials {
  email: string;
  password: string;
}

interface SignUpData extends UserCredentials {
  name: string;
}

// Sign in function
export async function signIn(credentials: UserCredentials) {
  try {
    // TODO: Implement actual authentication logic
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Sign in failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

// Sign up function
export async function signUp(data: SignUpData) {
  try {
    // TODO: Implement actual sign up logic
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Sign up failed');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
} 