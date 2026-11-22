/* Local benchmark for the set-based bucket import.
 *
 *   cd ui && DATABASE_URL=postgres://postgres:postgres@localhost:35432/cobudget \
 *     npx tsx scripts/bench-import-buckets.ts [rows=40] [items=22] [runs=3]
 *
 * Seeds a throwaway group/round/admin in the LOCAL database, then times
 * importBucketsTx (set-based) against a naive per-row nested-create baseline.
 * Refuses to run unless DATABASE_URL points at localhost.
 */
import { PrismaClient } from "@prisma/client";
import cuid from "cuid";
import { importBucketsTx } from "../server/services/bucketImport.service";

const [rows = "40", items = "22", runs = "3"] = process.argv.slice(2);
const ROWS = Number(rows);
const ITEMS = Number(items);
const RUNS = Number(runs);

if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? "")) {
  console.error("Refusing to run: DATABASE_URL is not localhost.");
  process.exit(1);
}

const prisma = new PrismaClient({ log: [{ emit: "event", level: "query" }] });
let queries = 0;
(prisma as any).$on("query", () => queries++);

const LONG = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(
  20
);
const AREAS = ["Health", "Education", "Environment"];

async function seed() {
  const tag = cuid().slice(-8);
  const group = await prisma.group.create({
    data: { slug: `bench-${tag}`, name: `bench ${tag}` },
  });
  const round = await prisma.round.create({
    data: {
      slug: "r",
      title: "bench round",
      groupId: group.id,
      registrationPolicy: "OPEN",
      currency: "GBP",
    },
  });
  const user = await prisma.user.create({
    data: {
      email: `bench-${tag}@example.invalid`,
      username: `bench${tag}`,
    } as any,
  });
  const member = await prisma.roundMember.create({
    data: {
      roundId: round.id,
      userId: user.id,
      isAdmin: true,
      isApproved: true,
    },
  });
  const mk = (name: string, type: any, options: string[] = [], pos = 0) =>
    prisma.field.create({
      data: {
        roundId: round.id,
        name,
        description: "",
        type,
        options,
        isRequired: false,
        position: pos,
      },
    });
  const ref = await mk("Reference Code", "TEXT", [], 1);
  const area = await mk("Priority Area", "ENUM", AREAS, 2);
  const longs = await Promise.all(
    [
      "Project Description",
      "What are you trying to achieve",
      "Who, what, how long",
      "Safety measures",
      "Who benefits",
      "Sustainability",
      "Key Fund's Comments",
    ].map((n, i) => mk(n, "MULTILINE_TEXT", [], 3 + i))
  );
  return { round, member, ref, area, longs };
}

function makeRows(s: Awaited<ReturnType<typeof seed>>, prefix: string): any[] {
  return Array.from({ length: ROWS }, (_, i) => ({
    title: `Bench proposal ${prefix}-${i}`,
    summary: "A one line summary under the 160 character limit.",
    referenceCode: `${prefix}-${String(i).padStart(3, "0")}`,
    fieldValues: [
      { fieldId: s.area.id, value: AREAS[i % AREAS.length] },
      ...s.longs.map((f) => ({ fieldId: f.id, value: LONG })),
    ],
    budgetItems: Array.from({ length: ITEMS }, (_, j) => ({
      description: `Budget item ${j + 1}`,
      amount: (j + 1) * 12345,
    })),
    images: [
      {
        small: "https://example.invalid/s.jpg",
        large: "https://example.invalid/l.jpg",
      },
    ],
  }));
}

// Baseline: the per-row nested create from the original plan.
async function naiveImport(tx: any, s: any, rows: any[]) {
  for (const r of rows) {
    const tag = await tx.tag.upsert({
      where: { roundId_value: { roundId: s.round.id, value: r.referenceCode } },
      create: { roundId: s.round.id, value: r.referenceCode },
      update: {},
    });
    await tx.bucket.create({
      data: {
        round: { connect: { id: s.round.id } },
        title: r.title,
        summary: r.summary,
        publishedAt: new Date(),
        approvedAt: new Date(),
        statusAccount: { create: {} },
        outgoingAccount: { create: {} },
        cocreators: { connect: { id: s.member.id } },
        Images: { create: r.images },
        BudgetItems: {
          create: r.budgetItems.map((b: any) => ({
            description: b.description,
            min: b.amount,
            type: "EXPENSE",
          })),
        },
        FieldValues: {
          create: [
            ...r.fieldValues,
            { fieldId: s.ref.id, value: r.referenceCode },
          ],
        },
        tags: { connect: { id: tag.id } },
      },
    });
  }
}

async function timed(label: string, fn: () => Promise<void>) {
  queries = 0;
  const t0 = process.hrtime.bigint();
  await fn();
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  console.log(
    `${label.padEnd(10)} ${ms.toFixed(0).padStart(6)} ms  ${String(
      queries
    ).padStart(5)} queries`
  );
  return ms;
}

async function main() {
  console.log(`${ROWS} rows x ${ITEMS} budget items, ${RUNS} runs each\n`);
  for (let run = 0; run < RUNS; run++) {
    const s = await seed();
    await timed("set-based", async () => {
      await prisma.$transaction(
        (tx) =>
          importBucketsTx(tx, {
            roundId: s.round.id,
            roundMemberId: s.member.id,
            rows: makeRows(s, `S${run}`),
          }),
        { timeout: 30000 }
      );
    });
    const [b, bi, fv, tg, co] = await Promise.all([
      prisma.bucket.count({ where: { roundId: s.round.id } }),
      prisma.budgetItem.count({ where: { Bucket: { roundId: s.round.id } } }),
      prisma.fieldValue.count({ where: { Bucket: { roundId: s.round.id } } }),
      prisma.tag.count({ where: { roundId: s.round.id } }),
      prisma.bucket.count({
        where: {
          roundId: s.round.id,
          cocreators: { some: { id: s.member.id } },
        },
      }),
    ]);
    console.log(
      `           buckets=${b} budgetItems=${bi} fieldValues=${fv} tags=${tg} withCocreator=${co}`
    );

    const s2 = await seed();
    await timed("per-row", async () => {
      await prisma.$transaction(
        (tx) => naiveImport(tx, s2, makeRows(s2, `N${run}`)),
        { timeout: 120000, maxWait: 10000 }
      );
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
