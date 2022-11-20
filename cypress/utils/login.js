import generateToken from "./generateToken";

export default function () {
    const token = generateToken({ destination: Cypress.env("email") });
    const magicLink = "http://localhost:3000/api/auth/magiclink/callback?token=" + token;
    cy.visit(magicLink);
}