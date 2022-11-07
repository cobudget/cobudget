describe("Test basic functionality", () => {
  it("Page loads successfully", () => {
    cy.visit("localhost:3000")
    .contains("Make ideas and money flow")
  });
});
