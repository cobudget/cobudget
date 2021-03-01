import getRandomValues from "get-random-values";

const ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));
const toBase64URL = (base64) =>
  base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const btoa = (b) => Buffer.from(b).toString("base64");

export default function (currentOrg) {
  const applicationName = "Dreams";
  const scopes = "read,write,session_info";
  const redirectUrl = process.env.IS_PROD
    ? `https://${
        currentOrg.customDomain
          ? currentOrg.customDomain
          : `${currentOrg.subdomain}.${process.env.DEPLOY_URL}`
      }/api/connect-discourse`
    : `http://${currentOrg.subdomain}.localhost:3000/api/connect-discourse`;

  // inspired by github.com/edgeryders/tell
  const randomClientId = toBase64URL(
    btoa(ab2str(getRandomValues(new Uint8Array(30))))
  );
  const randomNonce = toBase64URL(
    btoa(ab2str(getRandomValues(new Uint8Array(30))))
  );

  // const forgeKeypair = forge.pki.rsa.generateKeyPair({
  //   bits: 2048,
  //   e: 0x10001,
  // });
  // const privPem = forge.pki.privateKeyToPem(forgeKeypair.privateKey);
  // const privKey = forge.pki.privateKeyFromPem(privPem);
  // const pubKey = forge.pki.rsa.setPublicKey(privKey.n, privKey.e);
  // const pubKeyPem = forge.pki.publicKeyToPem(pubKey).replace(/\r/g, "");
  // const pubKeyPem = forge.pki.publicKeyToPem(pubKey).replace(/\r/g, "");

  const pubKeyPem = process.env.NEXT_PUBLIC_TOKEN_KEY;
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
