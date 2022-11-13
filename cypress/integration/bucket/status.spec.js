import login from "../login"
import get from "../../utils/get";
import { createBucket } from "../../utils/bucket";

describe("Update bucket status", () => {
    beforeEach(login);

    const roundSlug = `empty`;

    it("updates bucket status", () => {
        createBucket(roundSlug, `Bucket ${now}`);



    });


})