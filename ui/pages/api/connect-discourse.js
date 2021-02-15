import forge from "node-forge";

const atob = (a) => Buffer.from(a, "base64").toString("binary");

const btoa = (b) => Buffer.from(b).toString("base64");

export default function (req, res) {
  const { query } = req;
  const { payload } = query;
  const pem = process.env.PRIVATE_KEY;
  const privKey = forge.pki.privateKeyFromPem(pem);
  const cleanPayload = payload.replace(/ /g, "");
  const cypherCode = atob(cleanPayload);
  const decryptCode = privKey.decrypt(cypherCode, "RSAES-PKCS1-V1_5");
  const { key } = JSON.parse(decryptCode);
  console.log({ key });

  // connect to mongodb here, save discourseApiKey for this particular user.
  // hmm,
  // orgId and userId,

  // import Organization and OrgMember..
  // TODO: decode auth token to get user id

  res.writeHead(302, {
    Location: "/", // This is your url which you want to redirect to
  });
  res.end();
}
