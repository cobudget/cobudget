import login from "../login"
import get from "../../utils/get";

describe("Creates bucket", () => {

    beforeEach(login);
    const roundSlug = "empty";
    const now = Date.now();

    it("creates a bucket", () => {
        cy.visit(`c/${roundSlug}/`)

        get("create-new-bucket-button")
        .click();

        get("new-bucket-title-input")
        .type(`Bucket ${now}`)
        .type("{enter}");

        get("bucket-title-view")
        .contains(`Bucket ${now}`);
    });

});