import forge from "node-forge";

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function toBase64URL(base64) {
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export default function (currentOrg) {
  const applicationName = "Dreams";
  const redirectUrl = `${process.env.IS_PROD ? "https" : "http"}://${
    currentOrg.subdomain
  }.${
    process.env.IS_PROD ? process.env.DEPLOY_URL : "localhost:3000"
  }/api/connect-discourse`; // TODO: add custom domain support

  const scopes = "read,write,session_info";
  const ClientId_raw = crypto.getRandomValues(new Uint8Array(30));
  const randomClientId = toBase64URL(btoa(ab2str(ClientId_raw)));
  const randomNonce = "4_1cKKiIeDK6k2G_hXTIN7IL7lEXB-Ng4Ugd6iVe";

  // const forgeKeypair = forge.pki.rsa.generateKeyPair({
  //   bits: 2048,
  //   e: 0x10001,
  // });
  // const privPem = forge.pki.privateKeyToPem(forgeKeypair.privateKey);

  const pem = process.env.PRIVATE_KEY;

  const privKey = forge.pki.privateKeyFromPem(pem);
  const pubKey = forge.pki.rsa.setPublicKey(privKey.n, privKey.e);
  const pubKeyPem = forge.pki.publicKeyToPem(pubKey).replace(/\r/g, "");
  const url = new URL(currentOrg.discourseUrl);
  url.pathname = "/user-api-key/new";
  url.searchParams.set("auth_redirect", redirectUrl);
  url.searchParams.set("application_name", applicationName);
  url.searchParams.set("client_id", randomClientId);
  url.searchParams.set("scopes", scopes);
  url.searchParams.set("public_key", pubKeyPem);
  url.searchParams.set("nonce", randomNonce);

  return url.href;
}
