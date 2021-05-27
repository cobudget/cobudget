import React from "react";
import { KcApp, defaultKcProps, kcContext } from "keycloakify";

const KeycloakApp = ({ mock }) => {
  return (
    <React.StrictMode>
      <KcApp
        kcContext={mock ?? kcContext}
        {...{
          ...defaultKcProps,
          // This injects the class properly but index.css doesn't seem to be
          // able to get imported, at least in storybook
          kcHeaderWrapperClass: "top-class",
        }}
      />
    </React.StrictMode>
  );
};

export default KeycloakApp;
