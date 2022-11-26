import login from "../../utils/login";
import { createRound } from "../../utils/round";

describe("Updates bucket review round settings", () => {
    beforeEach(login);

    const roundSlug = `round${Date.now()}`;

    before(() => {
        login();
        createRound(roundSlug);
    });

    it("should be updated to true", () => {
        cy.visit(`c/${roundSlug}/settings/bucket-review`);

        let form = cy.get("[data-testid=bucket-review-settings-form]");
        form.get("select").eq(0).select("true");

        cy.get("[data-testid=submit-bucket-review-settings]").click();
        cy.visit(`c/${roundSlug}/settings/bucket-review`);

        form = cy.get("[data-testid=bucket-review-settings-form]");
        form.get("select").should("have.value", "true");
    });

    it("should be updated to false", () => {
        cy.visit(`c/${roundSlug}/settings/bucket-review`);

        let form = cy.get("[data-testid=bucket-review-settings-form]");
        form.get("select").eq(0).select("false");

        cy.get("[data-testid=submit-bucket-review-settings]").click();
        cy.visit(`c/${roundSlug}/settings/bucket-review`);

        form = cy.get("[data-testid=bucket-review-settings-form]");
        form.get("select").should("have.value", "false");
    });

});