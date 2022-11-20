import login from "../login";
import get from "../../utils/get";
import { createBucket } from "../../utils/bucket";
import { createRound } from "../../utils/round";

describe("Bucket filtering", () => {
    beforeEach(login);

    const now = Date.now();
    const roundSlug = `round-${now}`;

    it("filters buckets on based on statuses", () => {

        //createRound(roundSlug);
        for (let i = 0; i <= 3; i++) {
            break;
            createBucket(roundSlug, `Bucket ${now}`);

            get("publish-bucket")
            .click();

            if (i === 0) continue;

            get("open-for-funding-button")
            .click();

            if (i === 1) continue;

            cy.reload();

            get("bucket-status-view")
            .contains("Funding Open");

            get("accept-funding-button")
            .click();

            cy.on("window:confirm", (text) => {
                expect(text)
                .to
                .satisfy((text) => {
                    const confirmMsgs = [
                        "Are you sure you would like to accept and finalize funding for this bucket? This can't be undone.",
                        "Are you sure you would like to mark this bucket as completed? This can't be undone."
                    ];
                    return confirmMsgs.indexOf(text) > -1;
                })

                return true;
            });

            cy.reload();

            // Since we haven't added any budget for this bucket,
            // it's status should be funded.
            get("bucket-status-view")
            .contains("Funded");

            if (i === 2) continue;

            get("mark-as-completed-button")
            .click();

            cy.reload();

            get("bucket-status-view")
            .contains("Completed");
        }

        cy.visit(`c/${roundSlug}/?f=HIDE_ALL`);
        const items = ["PENDING_APPROVAL", "OPEN_FOR_FUNDING", "FUNDED", "COMPLETED"];
        for (let i = 0; i < items.length; i++) {

            if (i === 0)
            get("bucket-status-filter-select")
            .find("button")
            .click()

            const cb = get(`bucket-filter-options-${items[i]}`)
            .find("input[type=checkbox]");

            cb.check();
            cb.wait(500);

            get("buckets-view")
            .find("a")
            .find(["data-testid=bucket-card"])
            .should("have.length", 1)

            cb.uncheck();

        }

    });

});