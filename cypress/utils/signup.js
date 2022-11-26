import get from "../utils/get";
import login from "./login";

export default function signup () {
    login();

     cy.get("body")
    .then(($body) => {
        if ($body.find("[data-testid=signup-user-fullname]").length) {
            get("signup-user-fullname")
            .type(`name${Date.now()}`);
            get("signup-user-username")
            .type(`user${Date.now()}`);

            get("finish-signup-button")
            .click();
        }
    });
}