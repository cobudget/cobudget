import login from "../login"
import get from "../../utils/get";
import { createBucket } from "../../utils/bucket";

describe("Creates bucket", () => {

    beforeEach(login);
    const roundSlug = "empty";
    const now = Date.now();

    it("creates a bucket", () => {
        createBucket(roundSlug, `Bucket ${now}`);

        get("bucket-title-view")
        .contains(`Bucket ${now}`);
    });

});