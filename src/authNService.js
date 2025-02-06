export const authenticate = async (username, password) => {
  try {
    console.log(`username: ${username}`);
    console.log(`password: ${password}`);
  
    const response = await fetch('/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error during authentication:', error);
    return { success: false, error: error.message };
  }
};