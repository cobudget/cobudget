const KcAdminClient = require("keycloak-admin").default;

module.exports = async function () {
  if (
    !process.env.KEYCLOAK_AUTH_SERVER ||
    !process.env.KEYCLOAK_ADMIN_USERNAME ||
    !process.env.KEYCLOAK_ADMIN_PASSWORD ||
    !process.env.KEYCLOAK_REALM
  ) {
    throw new Error(
      `Missing required keycloak admin env var ${process.env.KEYCLOAK_AUTH_SERVER} ${process.env.KEYCLOAK_ADMIN_USERNAME} ${process.env.KEYCLOAK_ADMIN_PASSWORD?.[0]} ${process.env.KEYCLOAK_REALM}`
    );
  }
  const kcAdminClient = new KcAdminClient({
    baseUrl: process.env.KEYCLOAK_AUTH_SERVER,
    realmName: "master",
    requestConfig: {
      /* Axios request config options https://github.com/axios/axios#request-config */
    },
  });

  // Authorize with username / password
  await kcAdminClient.auth({
    username: process.env.KEYCLOAK_ADMIN_USERNAME,
    password: process.env.KEYCLOAK_ADMIN_PASSWORD,
    grantType: "password",
    clientId: "admin-cli",
    totp: "123456", // optional Time-based One-time Password if OTP is required in authentication flow
  });

  kcAdminClient.setConfig({
    realmName: process.env.KEYCLOAK_REALM,
  });

  return kcAdminClient;
};
