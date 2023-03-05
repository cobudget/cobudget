import generateToken from "./generateToken";

export default function () {
  const token = generateToken({ destination: Cypress.env("email") });
  const magicLink = "api/auth/magiclink/callback?token=" + token;
  cy.visit(magicLink, { timeout: 60000 });
  cy.url().should("be.equal", `${Cypress.config("baseUrl")}`);
}
