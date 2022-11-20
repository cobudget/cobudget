import login from "../login";
import { createRound } from "../../utils/round";
import get from "../../utils/get";

describe("Test participants", () => {
    beforeEach(login);

    const participtantEmail = `participants${Date.now()}@test.com`;
    const roundSlug = `round-${Date.now()}`;

    it("invites participants by email", () => {

        createRound(roundSlug);

        cy.visit(`c/${roundSlug}/participants`);

        get("invite-participant-button")
        .click();

        get("invite-participants-emails")
        .type(participtantEmail);

        get("invite-participants-email-button")
        .click();

        cy.wait(1000)

        get("invited-participtant-email")
        .contains(participtantEmail);
    });

});