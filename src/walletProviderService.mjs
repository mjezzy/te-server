import 'isomorphic-fetch';
import { issueAccessRequest, getFile } from "@inrupt/solid-client-access-grants";
import { Session } from "@inrupt/solid-client-authn-node";
import { config } from "dotenv";

config({ path: ".env.local" });
const enterpriseSession = new Session();
const userSession = new Session();
const userPodStorage = "https://storage.inrupt.com/70ba5def-6b7a-48d9-ac7f-4649f0cd9460/";

// 0. AuthN session as the companion app
const enterpriseLogin = async () => {
  try {
    await enterpriseSession.login({
      oidcIssuer: process.env.ENTERPRISE_OIDC_ISSUER,
      clientId: process.env.ENTERPRISE_CLIENT_ID,
      clientSecret: process.env.ENTERPRISE_CLIENT_SECRET,
    });
    console.log(`Logged in as ${enterpriseSession.info.webId}`);
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Enterprise authentication failed');
  }
};

const userLogin = async () => {
  try {
    await userSession.login({
      oidcIssuer: process.env.ENDUSER_OIDC_ISSUER,
      clientId: process.env.ENDUSER_CLIENT_ID,
      clientSecret: process.env.ENDUSER_CLIENT_SECRET,
    });
    console.log(`Logged in as ${userSession.info.webId}`);
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('User authentication failed');
  }
};

export const getUserData = async (resourceOwner) => {
  try {
    await enterpriseLogin();
    await userLogin();

    // 1. Issue access request to VC service
    const vcData = await issueAccessRequest(
      {
        access: { read: true },
        resourceOwner: resourceOwner,
        resources: [userPodStorage + '/wallet/user-preferences.json'],
        expirationDate: new Date(Date.now() + 60 * 60 * 10000),
      },
      {
        fetch: userSession.fetch,
        accessEndpoint: "https://vc.inrupt.com", //needed?
      }
    );
    console.log(`VC data: ${JSON.stringify(vcData)}`);
    // 2. Send access request to inbox
    const inboxUrl = "https://storage.inrupt.com/70ba5def-6b7a-48d9-ac7f-4649f0cd9460/inbox/";
    const vp = `{ "@context": ["https://www.w3.org/2018/credentials/v1"], "type": "VerifiablePresentation", "verifiableCredential": [${JSON.stringify(vcData)}]}`;
    var a = await enterpriseSession.fetch(inboxUrl, { method: 'POST', body: vp });
    console.log(JSON.stringify(a.status));
    console.log(`Inbox URL: ${inboxUrl}`);

    // 3. Grant access
    const walletApi = 'https://datawallet.inrupt.com';
    const vcId = vcData.id.substring('https://vc.inrupt.com/vc/'.length);

    const grantsUrl = walletApi + '/inbox/' + vcId + '/grantAccess';
    const y = await userSession.fetch(grantsUrl, { method: 'PUT' });
    console.log(JSON.stringify(y));
    
    // 4. Get list of grants
    const getGrantsUrl = walletApi + '/accessgrants';//"https://storage.inrupt.com/70ba5def-6b7a-48d9-ac7f-4649f0cd9460/accessgrants";
    const grantsList = await userSession.fetch(getGrantsUrl, { method: 'GET' });
    const firstGrant = grantsList[0];
    console.log(`1st Grants list: ${await JSON.stringify(firstGrant)}`); //.json()}`);
    
    // 5. Get data (getFile)
    const getFileRs = await getFile(
      {
        resourceUrl: grantsList[0].resource,//https://storage.inrupt.com/70ba5def-6b7a-48d9-ac7f-4649f0cd9460/wallet/user-preferences.json
        accessGrant: grantsList[0]
      },
      {
        fetch: enterpriseSession.fetch,
        //accessEndpoint: "https://vc.inrupt.com",
      }
    );
    // If the file is a JSON type, convert it to string.
    if (resourceUrl.endsWith('.json')) {
      return getFileRs.text();
    }
    
    // Check if the file is JSON based on the Content-Type header
    const contentType = getFileRs.headers.get("content-type") || "";
    const fileContents = contentType.includes("application/json")
      ? await getFileRs.text()
      : getFileRs;
    console.log(`File contents: ${fileContents}`);

    const x = await grantsList.json();
    console.log(`Grants list: ${JSON.stringify(x)}`);
    const data = await session.fetch(`getFile ${grantsUrl}/${grantsList[0].access.grant.id}/getfile`, {
      method: 'GET'
    });
    console.log(`Data: ${JSON.stringify(data)}`);
  
  } catch (error) {
    console.error('Get data request error:', error);
    throw error;
  }
};