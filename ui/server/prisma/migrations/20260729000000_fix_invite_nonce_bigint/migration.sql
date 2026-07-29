-- inviteNonce is generated with Date.now() -- a 13-digit millisecond timestamp
-- (~1.78x10^12) that overflows a 4-byte INTEGER (max 2,147,483,647). Widen both
-- invite-link columns to BIGINT. Same root cause already fixed on the
-- give-it-a-go branch/DB for Collection only (20260531000000_fix_invite_nonce_bigint);
-- this widens both tables on prod.
ALTER TABLE "Collection" ALTER COLUMN "inviteNonce" TYPE BIGINT;
ALTER TABLE "Organization" ALTER COLUMN "inviteNonce" TYPE BIGINT;
