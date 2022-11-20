import login from "../../utils/login";

describe("Updates guidelines round settings", () => {
    beforeEach(login);

    const roundSlug = Cypress.env("roundSlug");
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

    it("edits a guideline title", () => {
        const now = Date.now();
        cy.visit(`c/${roundSlug}/settings/guidelines`);

        cy.get("[data-testid=edit-guideline]")
        .eq(0)
        .click();

        const title = cy.get("[data-testid=guideline-title]");

        title
        .focus()
        .clear()
        .type(`Updated title ${now}`);

        cy.get("[data-testid=submit-guideline]")
        .click();

        cy.contains("[data-testid=guideline-view]", `Updated title ${now}`);
    });

    it("edits guideline description", () => {
        const now = Date.now();
        cy.visit(`c/${roundSlug}/settings/guidelines`);

        cy.get("[data-testid=edit-guideline]")
        .eq(0)
        .click();

        cy.get("[data-testid=text-field-container-guideline-description]")
        .get("[contenteditable=true]")
        .focus()
        .clear()
        .type(`Updated description ${now}`);

        cy.get("[data-testid=submit-guideline]")
        .click();

        cy.contains(".markdown", `Updated description ${now}`);
    });
});