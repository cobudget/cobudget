import forge from "node-forge";
import auth from "lib/auth";
import jwt from "jsonwebtoken";
import platoCore from "@sensestack/plato-core";
import getHostInfo from "utils/getHostInfo";

const {
  db: { getConnection, getModels },
} = platoCore;

const atob = (a) => Buffer.from(a, "base64").toString("binary");

// const btoa = (b) => Buffer.from(b).toString("base64");

export default async function (req, res) {
  const { query } = req;
  const { payload } = query;
  const pem = process.env.PRIVATE_KEY;
  const privKey = forge.pki.privateKeyFromPem(pem);
  const cleanPayload = payload.replace(/ /g, "");
  const cypherCode = atob(cleanPayload);
  const decryptCode = privKey.decrypt(cypherCode, "RSAES-PKCS1-V1_5");
  const decryptedPayload = JSON.parse(decryptCode);

  const { key: discourseApiKey } = decryptedPayload;

  const tokenCache = auth(req).tokenCache(req, res);
  const { accessToken } = await tokenCache.getAccessToken();
  const { sub: userId } = jwt.decode(accessToken);

  const { subdomain } = getHostInfo(req);

  const db = await getConnection(process.env.MONGO_URL);
  const { OrgMember, Organization } = getModels(db);

  const organization = await Organization.findOne({ subdomain });

  if (!organization.discourse) throw new Error("Missing discourse config");

  // get discourse username
  const discourseUserResponse = await fetch(
    `${organization.discourse.url}/session/current.json`,
    {
      headers: {
        "User-Api-Key": discourseApiKey,
        "Content-Type": "application/json",
      },
    }
  );

  const {
    current_user: { username },
  } = await discourseUserResponse.json();

  // save discourse user api key and username in database
  await OrgMember.update(
    { userId, organizationId: organization.id },
    { discourseApiKey, discourseUsername: username }
  );

  // TODO: error handling

  res.writeHead(302, {
    Location: "/connect-discourse",
  });
  res.end();
}
