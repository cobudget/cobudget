import login from "../login";

describe("Updates general round settings", () => {
    beforeEach(login);

    const roundSlug = "updated-slug-1667852059009";
    const updatedTitle = `updated-title-${Date.now()}`;
    const updatedSlug = `updated-slug-${Date.now()}`;

    it("updates round title", () => {
        cy.visit(`c/${roundSlug}/settings`);
        cy.get("[data-testid=round-title]")
        .focus()
        .clear()
        .type(updatedTitle)
        .type("{enter}");

        cy.get("[data-testid=navbar-round-title]")
        .should("have.text", updatedTitle);
    });

    it("updated round slug", () => {
        cy.visit(`c/${roundSlug}/settings`);
        cy.get("[data-testid=round-slug]")
        .focus()
        .clear()
        .type(updatedSlug)
        .type("{enter}");

        cy.url().should("be.equal", `${Cypress.config("baseUrl")}c/${updatedSlug}/settings`);
    });

});