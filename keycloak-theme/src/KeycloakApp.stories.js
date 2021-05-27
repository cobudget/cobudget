import React from "react";
import { kcContextMocks } from "keycloakify";

import KeycloakApp from "./KeycloakApp";

export const Login = () => <KeycloakApp mock={kcContextMocks.kcLoginContext} />;
export const Register = () => (
  <KeycloakApp mock={kcContextMocks.kcRegisterContext} />
);
export const Terms = () => <KeycloakApp mock={kcContextMocks.kcTermsContext} />;

export default {
  title: "Keycloak app",
  component: KeycloakApp,
};
