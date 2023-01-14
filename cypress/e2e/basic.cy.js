import login from "../utils/login";

describe("Test basic functionality", () => {
  before(login);

  it("Page loads successfully", () => {
    cy.visit("").contains("Make ideas and money flow");
  });
});
