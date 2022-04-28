import fetch from "isomorphic-unfetch";
import forge from "node-forge";
import prisma from "../../server/prisma";
import handler from "server/api-handler";

const atob = (a) => Buffer.from(a, "base64").toString("binary");

export async function connectDiscourse(req, res) {
  const { query } = req;
  const { payload, g } = query;

  console.log({ payload, g, req });

  const pem = process.env.PRIVATE_TOKEN_KEY;
  const privKey = forge.pki.privateKeyFromPem(pem);

  const cleanPayload = payload.replace(/ /g, "");
  const cypherCode = atob(cleanPayload);
  const decryptedPayload = privKey.decrypt(cypherCode, "RSAES-PKCS1-V1_5");
  const parsedPayload = JSON.parse(decryptedPayload);

  const { key: discourseApiKey } = parsedPayload;

  const group = await prisma.group.findUnique({
    where: { slug: g },
    include: { discourse: true },
  });

  if (!group.discourse) throw new Error("Missing discourse config");

  // get discourse username
  const discourseUserResponse = await fetch(
    `${group.discourse.url}/session/current.json`,
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
  const userId = req.user.id;

  console.log({ userId });

  await prisma.groupMember.update({
    where: { groupId_userId: { groupId: group.id, userId } },
    data: { discourseApiKey, discourseUsername: username },
  });

  // TODO: error handling

  res.writeHead(302, {
    Location: "/connect-discourse",
  });
  res.end();
}

export default handler().use(connectDiscourse);
