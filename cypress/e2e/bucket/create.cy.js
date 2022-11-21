import login from "../../utils/login"
import get from "../../utils/get";
import { createBucket } from "../../utils/bucket";
import { createRound } from "../../utils/round";

describe("Creates bucket", () => {

    beforeEach(login);
    const now = Date.now();
    const roundSlug = `round${now}`;

    before(() => {
        login();
        createRound(roundSlug);
    });

    it("creates a bucket", () => {
        createBucket(roundSlug, `Bucket ${now}`);

        get("bucket-title-view")
        .contains(`Bucket ${now}`);
    });

});