import login from "../login";

describe("Updates guidelines round settings", () => {
    beforeEach(login);

    const roundSlug = `empty`;
    const now = Date.now();

    it("adds a guideline", () => {
        cy.visit(`c/${roundSlug}/settings/guidelines`);
        
        cy.get("[data-testid=add-guideline-button]")
        .click();

        cy.get("[data-testid=guideline-title]")
        .type(`Title ${now}`)

        cy.get("[data-testid=text-field-container-guideline-description]")
        .get("[contenteditable=true]")
        .type(`Description ${now}`)

        cy.get("[data-testid=submit-guideline]")
        .click();

        
        cy.contains("[data-testid=guideline-view]", `Title ${now}`);
    });

});