//import crypto from "crypto";

// function randomString() {
//   return crypto.randomBytes(10).toString("hex");
// }

// TODO: a lot of this is copy pasted from realities, we should use it
// for inspiration and then remove it

describe("Test basic functionality", () => {
  it("Onboards successfully", () => {
    // const userEmail = "realitiestester@example.com";
    // const userPass = "password123";
    // const orgName = "Test org";
    // const needName = randomString();
    // const respName = randomString();

    cy.visit("localhost:3001")
      .contains("Digital tools for participant-driven culture")

      .root()
      .contains("Login")
      .click();

    // cy.intercept("/api/profile").as("profile");
    // // login page on keycloak
    // // see comment in cypress.json about how this is against best practices
    // cy.get("#username")
    //   .type(userEmail)
    //   .get("#password")
    //   .type(userPass)
    //   .get("#kc-form-login")
    //   .submit()
    //   .root()
    //   // waiting to get back to the homepage
    //   .contains("Digital tools for participant-driven culture")

    //   .wait("@profile")
    //   .its("response.statusCode")
    //   .should("eq", 200)

    //   .root()
    //   // element that renders in the top right when the user is logged in
    //   .get("[data-cy=user-is-logged-in]");

    // .root()
    // .contains(orgName)
    // .click()

    // .get("[data-cy=list-header-create-need-btn]")
    // .click()
    // .get("[data-cy=list-form-name-input]")
    // .type(needName)
    // .get("[data-cy=list-form")
    // .submit()

    // .get("[data-cy=list-header-create-resp-btn]")
    // .click()
    // .get("[data-cy=list-form-name-input]")
    // .type(respName)
    // .get("[data-cy=list-form")
    // .submit()

    // .get("[data-cy=detail-view-responsibility]")
    // .contains("Responsibility")
    // .get("[data-cy=detail-view-responsibility]")
    // .contains(respName);
  });
});
