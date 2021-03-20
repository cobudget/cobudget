import { initAuth0 } from "@auth0/nextjs-auth0";
import getHostInfo from "utils/getHostInfo";

export default (req) => {
  const { host, protocol } = getHostInfo(req);

  return initAuth0({
    auth0Logout: false,
    baseURL: `${protocol}://${host}`,
    clientID: process.env.KEYCLOAK_CLIENT_ID,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    issuerBaseURL: "https://auth.platoproject.org/auth/realms/plato",
    routes: {
      callback: "/api/callback",
      postLogoutRedirectUri: "/",
    },
    secret: process.env.COOKIE_SECRET,
    session: {
      absoluteDuration: false,
      rolling: true,
      rollingDuration: 60 * 60 * 24 * 7,
      cookie: {
        //domain: "" (optional)
        sameSite: "lax",
      },
    },
  });
};
