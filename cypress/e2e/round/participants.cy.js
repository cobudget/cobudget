import login from "../login";
import { createRound } from "../../utils/round";
import get from "../../utils/get";

describe("Test participants", () => {
    beforeEach(login);

    const participantEmail = `participants${Date.now()}@test.com`;
    const username = participantEmail.split("@")[0];
    const roundSlug = `round-${Date.now()}`;

    before(() => {
        login();
        createRound(roundSlug);
    });

    it("creates invitation link", () => {
        cy.visit(`c/${roundSlug}/participants`);
        get("invite-participant-button")
        .click();

        get("create-invitation-link")
        .click();

        cy.wait(500);
        get("invitation-link")
        .should("exist");

    });

    it("deletes invitation link", () => {
        cy.visit(`c/${roundSlug}/participants`);
        get("invite-participant-button")
        .click();

        get("delete-invitation-link")
        .click();

        cy.wait(500);
        get("invitation-link")
        .should("not.exist");

    });

    it("invites participants by email", () => {

        cy.visit(`c/${roundSlug}/participants`);

        get("invite-participant-button")
        .click();

        get("invite-participants-emails")
        .type(participantEmail);

        get("invite-participants-email-button")
        .click();

        cy.wait(1000)

        get("invited-participant-email")
        .contains(participantEmail);
    });

    it("removes a participant", () => {
        cy.visit(`c/${roundSlug}/participants`);

        get(`participant-action-button-${participantEmail.split("@")[0]}`)
        .click();

        get(`delete-participant-${username}`)
        .click();

        cy.wait(500);

        get("invited-participant-email")
        .contains(participantEmail)
        .should('not.exist');
    });

});