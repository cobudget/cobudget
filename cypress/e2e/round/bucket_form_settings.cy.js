import login from "../../utils/login";
import get from "../../utils/get";
import { createRound } from "../../utils/round";

describe("Update bucket form round settings", () => {
    beforeEach(login);

    const now = Date.now();
    const roundSlug = `round${now}`;
    const limit = 10;

    before(() => {
        login();
        createRound(roundSlug);
    });

    it("add long text", () => {
        cy.visit(`c/${roundSlug}/settings/bucket-form`);

        get("customfield-name-view")
        .invoke('text')
        .then(d => cy.log(d))

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

        cy.wait(1000);

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

        cy.wait(1000);

        get("customfield-name-view")
        .contains(`Long Name ${now}`);

        get("customfield-description-view")
        .contains(`Long Description ${now}`)

        get("customfield-type-view")
        .contains(`Type: Long Text`)
    });
    
});