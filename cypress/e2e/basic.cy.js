import login from "./login";

describe("Test basic functionality", () => {
  before(login);

  it("Page loads successfully", () => {
    cy.visit("")
    .contains("Make ideas and money flow")
  });

});
