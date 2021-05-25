import React from "react";
import ReactDOM from "react-dom";
import { KcApp, defaultKcProps, kcContext } from "keycloakify";
import "./index.css";
//import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <KcApp
      kcContext={kcContext}
      {...{
        ...defaultKcProps,
        kcHeaderWrapperClass: "top-class",
      }}
    />
  </React.StrictMode>,
  document.getElementById("root")
);
