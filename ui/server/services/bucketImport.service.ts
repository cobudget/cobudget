// Set-based bucket import. Deliberately imports nothing path-aliased so it can
// be driven from a plain script (see scripts/bench-import-buckets.ts).
//
// Why not reuse createBucket/editBucket per row: ~15 queries per row, and
// publishBucket emails every round member. Instead we pre-generate ids and
// write once per table across ALL rows (~10 queries total), inside the
// caller's transaction. No events are published.
import cuid from "cuid";
import {
  bucketImportConfig,
  normalizeCode,
  normalizeName,
} from "../../utils/bucketImport/config";
import type {
  ImportBucketRow,
  ImportFieldDef,
  ImportIssue,
} from "../../utils/bucketImport/types";
import { validateImportPayload } from "../../utils/bucketImport/validatePayload";

export class BucketImportValidationError extends Error {
  issues: ImportIssue[];
  constructor(issues: ImportIssue[]) {
    const shown = issues
      .slice(0, 10)
      .map((i) =>
        i.row === null ? i.message : `Row ${i.row + 1}: ${i.message}`
      );
    const more = issues.length > 10 ? `\n…and ${issues.length - 10} more` : "";
    super(`Import not written:\n${shown.join("\n")}${more}`);
    this.issues = issues;
  }
}

// Minimal structural type for the Prisma interactive-transaction client.
type Tx = any;

const toFieldDef = (f): ImportFieldDef => ({
  id: f.id,
  name: f.name,
  type: f.type,
  limit: f.limit,
  options: f.options,
  isRequired: f.isRequired,
});

/**
 * Round fields + the reference codes already used in the round
 * (tags of non-deleted buckets U Reference Code field values, normalised).
 * Shared by the commit mutation and the admin-only preview query.
 */
export async function loadImportContext(db: Tx, roundId: string) {
  const fields = await db.field.findMany({
    where: { roundId },
    orderBy: { position: "asc" },
  });
  const refField = fields.find(
    (f) =>
      normalizeName(f.name) ===
      normalizeName(bucketImportConfig.referenceCodeFieldName)
  );
  const existingCodes = new Set<string>();
  const tagRows = await db.tag.findMany({
    where: { roundId, buckets: { some: { deleted: false } } },
    select: { value: true },
  });
  tagRows.forEach((t) => existingCodes.add(normalizeCode(t.value)));
  if (refField) {
    const fvs = await db.fieldValue.findMany({
      where: { fieldId: refField.id, Bucket: { roundId, deleted: false } },
      select: { value: true },
    });
    fvs.forEach((fv) => {
      if (typeof fv.value === "string")
        existingCodes.add(normalizeCode(fv.value));
    });
  }
  return { fields, refField, existingCodes };
}

export async function importBucketsTx(
  tx: Tx,
  {
    roundId,
    roundMemberId,
    rows,
  }: { roundId: string; roundMemberId: string; rows: ImportBucketRow[] }
): Promise<string[]> {
  // Serialise imports per round: a double-submit waits here, then fails the
  // duplicate-reference-code check below instead of creating duplicates.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${
    "bucket-import:" + roundId
  }))`;

  const { fields, refField, existingCodes } = await loadImportContext(
    tx,
    roundId
  );

  const { errors } = validateImportPayload(rows, {
    fields: fields.map(toFieldDef),
    existingCodes,
  });
  if (errors.length) throw new BucketImportValidationError(errors);

  const now = new Date();
  const codes = rows.map((r) => r.referenceCode.trim());

  // Tags: find-or-create (round-scoped), then map code -> tag id.
  const tagIdByCode = new Map<string, string>();
  if (bucketImportConfig.createTagFromReferenceCode) {
    await tx.tag.createMany({
      data: codes.map((value) => ({ id: cuid(), roundId, value })),
      skipDuplicates: true,
    });
    const tags = await tx.tag.findMany({
      where: { roundId, value: { in: codes } },
      select: { id: true, value: true },
    });
    tags.forEach((t) => tagIdByCode.set(t.value, t.id));
  }

  // Pre-generate ids so every table can be written with one set-based insert.
  const bucketIds = rows.map(() => cuid());
  const statusAccountIds = rows.map(() => cuid());
  const outgoingAccountIds = rows.map(() => cuid());

  await tx.account.createMany({
    data: [...statusAccountIds, ...outgoingAccountIds].map((id) => ({ id })),
  });

  await tx.bucket.createMany({
    data: rows.map((row, i) => ({
      id: bucketIds[i],
      roundId,
      title: row.title.trim(),
      summary: row.summary?.trim() || null,
      publishedAt: bucketImportConfig.publishImmediately ? now : null,
      approvedAt: bucketImportConfig.approveImmediately ? now : null,
      statusAccountId: statusAccountIds[i],
      outgoingAccountId: outgoingAccountIds[i],
    })),
  });

  const budgetItems = rows.flatMap((row, i) =>
    row.budgetItems.map((item) => ({
      id: cuid(),
      bucketId: bucketIds[i],
      description: item.description.trim(),
      min: item.amount,
      max: null, // see decisions.md 2026-11-15: avoids editBucket's min>=max rejection
      type: "EXPENSE",
    }))
  );
  if (budgetItems.length) await tx.budgetItem.createMany({ data: budgetItems });

  const fieldValues = rows.flatMap((row, i) => {
    const byField = new Map<string, unknown>();
    row.fieldValues.forEach((fv) => {
      if (fv.value !== null && fv.value !== undefined && fv.value !== "")
        byField.set(fv.fieldId, fv.value);
    });
    byField.set(refField.id, codes[i]);
    return Array.from(byField.entries()).map(([fieldId, value]) => ({
      id: cuid(),
      bucketId: bucketIds[i],
      fieldId,
      value: value as any,
    }));
  });
  await tx.fieldValue.createMany({ data: fieldValues });

  const images = rows.flatMap((row, i) =>
    (row.images ?? []).map((img) => ({
      id: cuid(),
      bucketId: bucketIds[i],
      small: img.small ?? img.large ?? null,
      large: img.large ?? img.small ?? null,
    }))
  );
  if (images.length) await tx.image.createMany({ data: images });

  // Implicit m2m join tables have no createMany: one raw insert each.
  // A = Bucket id, B = the other side (verified against the migrated schema).
  await tx.$executeRaw`INSERT INTO "_BucketToRoundMember" ("A", "B")
    SELECT b, ${roundMemberId} FROM unnest(${bucketIds}::text[]) AS b`;
  if (bucketImportConfig.createTagFromReferenceCode) {
    const tagBucketIds = bucketIds;
    const tagIds = codes.map((c) => tagIdByCode.get(c));
    await tx.$executeRaw`INSERT INTO "_BucketToTag" ("A", "B")
      SELECT * FROM unnest(${tagBucketIds}::text[], ${tagIds}::text[])`;
  }

  return bucketIds;
}
