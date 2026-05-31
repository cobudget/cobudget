-- Fix inviteNonce column type: the original 20220410104856_invite_nonce_type migration
-- accidentally recreated the column as INTEGER instead of BIGINT. Date.now() returns a
-- 13-digit millisecond timestamp that overflows INT4 (max ~2.1B).
ALTER TABLE "Collection" ALTER COLUMN "inviteNonce" TYPE BIGINT;
