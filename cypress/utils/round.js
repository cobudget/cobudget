export const createRound = (roundSlug) => {
    cy.visit("new-round")
    cy.get("[data-testid=round-title]")
    .type(roundSlug)
    .type("{enter}");
}