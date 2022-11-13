import login from "../login";
import get from "../../utils/get";

describe("Update bucket form round settings", () => {
    beforeEach(login);

    const roundSlug = `empty`;
    const now = Date.now();
    const limit = 10;

    it("add long text", () => {
        cy.visit(`c/${roundSlug}/settings/bucket-form`);

        cy.get("[data-testid=add-form-item-button]")
        .click()

        get("customfield-type-select")
        .find("select")
        .eq(0)
        .select("MULTILINE_TEXT");

        get("customfield-name-input")
        .type(`Long Name ${now}`);

        get("customfield-description-input")
        .type(`Long Description ${now}`);

        get("customfield-limit-input")
        .type(limit);

        get("submit-custom-field-button")
        .click()

        get("customfield-name-view")
        .contains(`Long Name ${now}`);

        get("customfield-description-view")
        .contains(`Long Description ${now}`)

        get("customfield-type-view")
        .contains(`Type: Long Text`)
    });

    it("adds short text", () => {
        cy.visit(`c/${roundSlug}/settings/bucket-form`);

        cy.get("[data-testid=add-form-item-button]")
        .click()

        get("customfield-name-input")
        .type(`Name ${now}`);

        get("customfield-description-input")
        .type(`Description ${now}`);

        get("customfield-type-select")
        .find("select")
        .eq(0)
        .select("TEXT");

        get("customfield-limit-input")
        .type(limit);

        get("submit-custom-field-button")
        .click()

        get("customfield-name-view")
        .contains(`Long Name ${now}`);

        get("customfield-description-view")
        .contains(`Long Description ${now}`)

        get("customfield-type-view")
        .contains(`Type: Long Text`)
    });
    
});