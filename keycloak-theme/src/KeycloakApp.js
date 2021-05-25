import React from "react";
import { KcApp, defaultKcProps, kcContext, kcContextMocks } from "keycloakify";
import "./index.css";
// TODO: import index.css from preview.js instead, idk if it works to import from here
//import App from "./App";

const KeycloakApp = ({ mock }) => {
  return (
    <React.StrictMode>
      <KcApp
        kcContext={mock ? kcContextMocks.kcLoginContext : kcContext}
        {...{
          ...defaultKcProps,
          kcHeaderWrapperClass: "top-class",
        }}
      />
    </React.StrictMode>
  );
};

export default KeycloakApp;
