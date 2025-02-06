import 'isomorphic-fetch';
// import { issueAccessRequest } from "@inrupt/solid-client-access-grants";
import { Session } from "@inrupt/solid-client-authn-node";
import { config } from "dotenv";
import fetch, { Headers } from 'node-fetch';

config({ path: ".env.local" });

const session = new Session();

const login = async () => {
  try {
    await session.login({
      oidcIssuer: process.env.OPENID_PROVIDER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });
    console.log(`Logged in as ${session.info.webId}`);
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Authentication failed');
  }
};

export const createAccessRequest = async (resourceOwner, resources) => {
  try {
    await login();
    
    // Mock response for now, will integrate access grants later
    return {
      id: "mock-request-id-123",
      status: "approved",
      resourceOwner,
      resources
    };
    
    // TODO: Implement actual access request flow
    // const accessRequest = await issueAccessRequest(
    //   {
    //     access: { read: true },
    //     resourceOwner: resourceOwner,
    //     resources: resources,
    //     expirationDate: new Date(Date.now() + 60 * 60 * 10000),
    //   },
    //   {
    //     fetch: session.fetch,
    //     accessEndpoint: "https://vc.inrupt.com",
    //   }
    // );
    // return accessRequest;
  } catch (error) {
    console.error('Access request error:', error);
    throw error;
  }
};