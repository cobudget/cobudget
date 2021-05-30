import React from "react";
import { Button } from "@material-ui/core";
import { KcApp, defaultKcProps, kcContext } from "keycloakify";

const DefaultApp = ({ ctx }) => {
  return (
    <KcApp
      kcContext={ctx}
      {...{
        ...defaultKcProps,
        // This injects the class properly but index.css doesn't seem to be
        // able to get imported, at least in storybook
        kcHeaderWrapperClass: "top-class",
      }}
    />
  );
};

const Login = ({ ctx }) => {
  return (
    <Button variant="contained" color="primary">
      Primary
    </Button>
  );
};

const KeycloakApp = ({ mock }) => {
  const ctx = mock ?? kcContext;

  return (
    <React.StrictMode>
      {(() => {
        switch (ctx.pageId) {
          case "login.ftl":
            return <Login ctx={ctx} />;
          //case "register.ftl":
          //  return <Register {...{ kcContext, ...props }} />;
          //case "info.ftl":
          //  return <Info {...{ kcContext, ...props }} />;
          //case "error.ftl":
          //  return <Error {...{ kcContext, ...props }} />;
          //case "login-reset-password.ftl":
          //  return <LoginResetPassword {...{ kcContext, ...props }} />;
          //case "login-verify-email.ftl":
          //  return <LoginVerifyEmail {...{ kcContext, ...props }} />;
          //case "terms.ftl":
          //  return <Terms {...{ kcContext, ...props }} />;
          //case "login-otp.ftl":
          //  return <LoginOtp {...{ kcContext, ...props }} />;
          default:
            return <DefaultApp ctx={ctx} />;
        }
      })()}
    </React.StrictMode>
  );
};

export default KeycloakApp;
