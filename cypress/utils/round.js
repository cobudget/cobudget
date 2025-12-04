import get from "../utils/get";

export const createRound = (roundSlug) => {
  cy.visit("new-round");

  cy.get("[data-testid=round-title]").type(roundSlug);

  get("create-round-button").click({ force: true });
};
