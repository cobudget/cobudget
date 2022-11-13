import get from "./get";

export const createBucket = (roundSlug, name) => {
    cy.visit(`c/${roundSlug}/`)

    get("create-new-bucket-button")
    .click();

    get("new-bucket-title-input")
    .type(`${name}`)
    .type("{enter}");
}