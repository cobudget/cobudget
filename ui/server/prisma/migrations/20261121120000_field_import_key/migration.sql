-- Field.importKey: stable CSV column name for the bucket import.
-- Field.isUniqueIdentifier: import-only "unique per round" flag (set by admins, never backfilled).
ALTER TABLE "Field" ADD COLUMN "importKey" TEXT;
ALTER TABLE "Field" ADD COLUMN "isUniqueIdentifier" BOOLEAN NOT NULL DEFAULT false;

-- Backfill importKey for existing fields. Mirrors utils/fieldKey.ts for ASCII names:
-- lower-case, apostrophes dropped, "&" -> "-and-", every other run of non [a-z0-9]
-- -> "-", trimmed, capped at 40 chars. Non-latin names with no [a-z0-9] become
-- "field". Reserved built-in column names (title, summary, image, budget-item-N,
-- budget-amount-N) get a
-- "-field" suffix. Duplicates within a round get -2, -3, ... (loop, so a
-- generated "-2" can never collide with an existing key).
DO $$
DECLARE
  f RECORD;
  base TEXT;
  candidate TEXT;
  n INT;
BEGIN
  FOR f IN SELECT "id", "name", "collectionId" FROM "Field"
           ORDER BY "collectionId", "position", "createdAt", "id"
  LOOP
    base := lower(f."name");
    base := replace(replace(replace(base, '''', ''), U&'\2019', ''), U&'\2018', '');
    base := replace(base, '&', '-and-');
    base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
    base := regexp_replace(base, '^-+|-+$', '', 'g');
    base := left(base, 40);
    base := regexp_replace(base, '-+$', '', 'g');
    IF base = '' THEN base := 'field'; END IF;
    IF base IN ('title', 'summary', 'image') OR base ~ '^budget-(item|amount)-[0-9]+$' THEN
      base := base || '-field';
    END IF;

    candidate := base;
    n := 1;
    WHILE EXISTS (
      SELECT 1 FROM "Field"
      WHERE "collectionId" = f."collectionId" AND "importKey" = candidate
    ) LOOP
      n := n + 1;
      candidate := left(base, 40 - length('-' || n::text)) || '-' || n::text;
    END LOOP;

    UPDATE "Field" SET "importKey" = candidate WHERE "id" = f."id";
  END LOOP;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX "Field_collectionId_importKey_key" ON "Field"("collectionId", "importKey");
