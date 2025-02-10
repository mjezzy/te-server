
// AuthN session
export const login = async (podStorageUrl) => {
  try {
    await session.login({
      oidcIssuer: process.env.OPENID_PROVIDER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      tokenType: "Bearer" // needed?
    });
    console.log(`Logged in as ${session.info.webId}`);
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Authentication failed');
  }
};