import login from "../../utils/login";
import { createBucket } from "../../utils/bucket";
import get from "../../utils/get";
import { createRound } from "../../utils/round";

describe("Bucket budget", () => {

    beforeEach(login);
    const now = Date.now();
    const roundSlug = `round${Date.now()}`;

    it("adds budget item to bucket", () => {
        createRound(roundSlug);
        const minAmount = 1000;

        cy.visit(`c/${roundSlug}`);
        createBucket(roundSlug, `Bucket ${now}`);

        get("add-bucket-budget-button")
        .click();

        get("add-bucket-cost-button")
        .click();

        get("bucket-expense-item-description")
        .type(`Budget ${now}`);
        get("bucket-expense-item-min-amount")
        .type(minAmount)
        .type("{enter}");

        get("bucket-cost-description-view")
        .contains(`Budget ${now}`);

        //todo: check formatted currency budget
    });
});