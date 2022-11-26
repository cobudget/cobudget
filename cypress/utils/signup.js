import get from "../utils/get";
import login from "./login";

export default function signup () {
    login();
    cy.visit(Cypress.config("baseUrl"));
    cy.wait(20000)
    cy.get("body")
    .then(($body) => {
        cy.log("Starting wait", $body.find("[data-testid=signup-user-fullname]").length)
        if ($body.find("[data-testid=signup-user-fullname]").length) {
            get("signup-user-fullname")
            .type(`name${Date.now()}`);
            get("signup-user-username")
            .type(`user${Date.now()}`);

            get("finish-signup-button")
            .click();
        }
    });
    cy.log("Hello waiting");
}