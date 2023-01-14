import { createRound } from "../../utils/round";
import login from "../../utils/login";

describe("Create a round", () => {
  beforeEach(login);

  const roundSlug = `cypress-test-round-${Date.now()}`;

  it("checks required fields", () => {
    cy.visit("new-round");
    cy.get("[data-testid=round-title]").type("{enter}");

    cy.get("[data-testid=helpertext-round-title]").contains("Required");
  });

  it("creates a round", () => {
    createRound(roundSlug);

    cy.url().should("be.equal", `${Cypress.config("baseUrl")}c/${roundSlug}`);
  });
});
