import login from "../utils/login";

describe("Test basic functionality", () => {
  before(login);

  it("Page loads successfully", () => {
    cy.visit("").contains("You are using Cobudget");
  });
});
