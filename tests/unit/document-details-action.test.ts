import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseDateToMidnight } from "@/lib/utils/document-filters";

describe("Document Details Action & Date Evaluation", () => {
    it("parses valid_from and expires_at properly", () => {
        const validFrom = "19.05.2026";
        const expiresAt = "18.05.2029";

        const pValid = parseDateToMidnight(validFrom);
        const pExpire = parseDateToMidnight(expiresAt);

        assert.ok(pValid);
        assert.ok(pExpire);
        assert.equal(pValid.getFullYear(), 2026);
        assert.equal(pExpire.getFullYear(), 2029);
        assert.ok(pExpire.getTime() > pValid.getTime());
    });

    it("evaluates expired status when expires_at is in the past", () => {
        const pastDateStr = "01.01.2020";
        const expDate = parseDateToMidnight(pastDateStr);
        assert.ok(expDate);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isExpired = expDate.getTime() < today.getTime();
        assert.equal(isExpired, true);
    });

    it("evaluates active status when expires_at is in the future", () => {
        const futureDateStr = "01.01.2030";
        const expDate = parseDateToMidnight(futureDateStr);
        assert.ok(expDate);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isExpired = expDate.getTime() < today.getTime();
        assert.equal(isExpired, false);
    });
});
