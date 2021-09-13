// todo: add an exception for jest globals
/* eslint-disable no-undef */
import crypto from "crypto";

function randomString() {
  return crypto.randomBytes(10).toString("hex");
}

describe("Test basic functionality", () => {
  it("Create an org and a need", () => {
    const userEmail = "realitiestester@example.com";
    const userPass = "password123";
    const orgName = "Test org";
    const needName = randomString();
    const respName = randomString();

    cy.visit("localhost:2551")
      .contains("Pick an organization")
      .root()
      .contains("Login")
      .click()

      // login page on keycloak
      // see comment in cypress.json about how this is against best practices
      // TODO: handle cases where user is already logged in
      // should be enough to click logout if already logged in
      .get("#username")
      .type(userEmail)
      .get("#password")
      .type(userPass)
      .get("#kc-form-login")
      .submit()
      .root()
      // waiting to get back to the homepage
      .contains("Pick an organization")

      .root()
      .contains(orgName)
      .click()

      .get("[data-cy=list-header-create-need-btn]")
      .click()
      .get("[data-cy=list-form-name-input]")
      .type(needName)
      .get("[data-cy=list-form")
      .submit()

      .get("[data-cy=list-header-create-resp-btn]")
      .click()
      .get("[data-cy=list-form-name-input]")
      .type(respName)
      .get("[data-cy=list-form")
      .submit()

      .get("[data-cy=detail-view-responsibility]")
      .contains("Responsibility")
      .get("[data-cy=detail-view-responsibility]")
      .contains(respName);
  });
});
