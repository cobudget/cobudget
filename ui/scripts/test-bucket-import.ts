/* Unit tests for the CSV bucket import parser/validator (plain node:assert).
 *
 *   cd ui && npx tsx scripts/test-bucket-import.ts [path/to/real.csv]
 *
 * The optional path runs the "real file" check (spec AC 2) without
 * committing any real data.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  baseColumns,
  normalizeCode,
  templateBudgetPairs,
} from "../utils/bucketImport/config";
import {
  buildTemplateCsv,
  parseAmountToMinor,
  parseCsvText,
  prepareImport as prepare,
  summarize,
} from "../utils/bucketImport/prepareImport";

const AREAS = [
  "Arts and Culture",
  "Beautiful Built Environment",
  "Green Economy",
  "Connected to Nature",
  "Secure Homes & Lives",
  "Community",
  "Education & Opportunities",
  "Thriving Town Centre",
  "Other",
];
const fields = [
  { id: "f-area", name: "Priority Area", type: "TEXT", options: AREAS },
  { id: "f-ref", name: "Reference Code", type: "TEXT", options: [] },
  { id: "f-date", name: "Report Date", type: "TEXT", options: [] },
  { id: "f-assessor", name: "Assessor", type: "TEXT", options: [] },
  {
    id: "f-kf",
    name: "Key Fund’s Comments",
    type: "MULTILINE_TEXT",
    options: [],
  },
  {
    id: "f-desc",
    name: "Project Description",
    type: "MULTILINE_TEXT",
    options: [],
  },
  {
    id: "f-ach",
    name: "What are they trying to achieve in the project?",
    type: "MULTILINE_TEXT",
    options: [],
  },
  {
    id: "f-who",
    name: "Who will do what? How long will it take? How do you make sure?",
    type: "MULTILINE_TEXT",
    options: [],
  },
  {
    id: "f-safe",
    name:
      "How will you make sure that people that engage in the activity are safe?",
    type: "MULTILINE_TEXT",
    options: [],
  },
  {
    id: "f-ben",
    name: "Who is the main group of people that will benefit from the project?",
    type: "MULTILINE_TEXT",
    options: [],
  },
  {
    id: "f-sust",
    name: "How will the activity continue after the grant has been spent?",
    type: "MULTILINE_TEXT",
    options: [],
  },
].map((f) => ({ ...f, limit: null, isRequired: false }));

let passed = 0;
const test = async (name: string, fn: () => Promise<void> | void) => {
  try {
    await fn();
    passed++;
    console.log(`ok   ${name}`);
  } catch (e) {
    console.error(`FAIL ${name}\n`, e);
    process.exitCode = 1;
  }
};

const run = async (text: string, existing: string[] = []) =>
  prepare(await parseCsvText(text), { fields, existingCodes: existing });
const issuesOf = (p: Awaited<ReturnType<typeof run>>, row: number) =>
  p.rows[row].issues;

async function main() {
  const H =
    "proposal_title,proposal_summary,reference_code,priority_area,budget_item_1,budget_amount_1";

  await test("amounts", () => {
    assert.equal(parseAmountToMinor("1200"), 120000);
    assert.equal(parseAmountToMinor("350.50"), 35050);
    assert.equal(parseAmountToMinor("1,234.5"), 123450);
    assert.equal(parseAmountToMinor("£99"), 9900);
    for (const bad of ["", "abc", "1.234", "-5", "1,23", "12e3", "99999999999"])
      assert.equal(parseAmountToMinor(bad), null, bad);
  });

  await test("BOM + CRLF + quoted multiline/commas parse intact", async () => {
    const t = await parseCsvText(
      `﻿${H}\r\n"Title, with comma","Line1\r\nLine2 ""quoted""",A1,Green Economy,Beds,100\r\n`
    );
    assert.equal(t.headers[0], "proposal_title");
    assert.equal(t.rows.length, 1);
    assert.equal(t.rows[0][0], "Title, with comma");
    assert.ok(
      t.rows[0][1].includes("Line2") && t.rows[0][1].includes('"quoted"')
    );
  });

  await test("semicolon delimiter (Excel in some locales)", async () => {
    const t = await parseCsvText(H.replace(/,/g, ";") + "\nT;S;A1;Other;B;5\n");
    assert.equal(t.headers.length, 6);
    assert.equal(t.rows[0][5], "5");
  });

  await test("leading # comment lines are skipped", async () => {
    const t = await parseCsvText(
      `# a, comment\n# another\n${H}\nT,S,A1,Other,B,5\n`
    );
    assert.equal(t.headers[0], "proposal_title");
    assert.equal(t.rows.length, 1);
  });

  await test("clean row has no issues except missing image warning", async () => {
    const p = await run(`${H},image_url\nT,S,A1,Green Economy,Beds,100,\n`);
    assert.deepEqual(p.fileIssues, []);
    assert.deepEqual(
      issuesOf(p, 0).map((i) => i.severity),
      ["warning"]
    );
    assert.equal(p.rows[0].totalMinor, 10000);
  });

  await test("22+ budget items, non-contiguous numbers, uses real N", async () => {
    const heads = Array.from(
      { length: 25 },
      (_, i) => `budget_item_${i + 1},budget_amount_${i + 1}`
    );
    const vals = Array.from({ length: 25 }, (_, i) =>
      i % 2 ? "," : `Item ${i + 1},10`
    );
    const p = await run(
      `proposal_title,proposal_summary,reference_code,${heads.join(
        ","
      )}\nT,S,A1,${vals.join(",")}\n`
    );
    assert.equal(p.budgetNumbers.length, 25);
    assert.equal(p.rows[0].payload.budgetItems.length, 13);
    assert.equal(p.rows[0].totalMinor, 13 * 1000);
  });

  await test("seeded bad data: each message lands on the right cell/row", async () => {
    const p = await run(
      [
        H,
        ",S,A1,Green Economy,B,10", // 0 missing title
        `T,${"x".repeat(161)},A2,Green Economy,B,10`, // 1 long summary
        "T,S,A3,Made Up Area,B,10", // 2 bad priority area
        "T,S,A4,Other,B,ten", // 3 non-numeric amount
        "T,S,A5,Other,B,1\nT,S,A5,Other,B,1", // (4,5) duplicate code in file
        "T,S,EXISTING,Other,B,1", // 6 duplicate vs round
      ]
        .join("\n")
        .replace("1\nT,S,A5", "1\nT,S,A5"),
      [normalizeCode("EXISTING")]
    );
    const at = (r: number, col: string, sev: string) =>
      issuesOf(p, r).some((i) => i.column === col && i.severity === sev);
    assert.ok(at(0, "proposal_title", "error"));
    assert.ok(at(1, "proposal_summary", "error"));
    assert.ok(at(2, "priority_area", "error"));
    assert.ok(at(3, "budget_amount_1", "error"));
    assert.ok(
      at(5, "reference_code", "error"),
      "dup code flagged on second row"
    );
    assert.ok(at(6, "reference_code", "error"), "dup vs existing");
    assert.equal(summarize(p).blocked, true);
    assert.equal(
      p.rows[3].issues.filter((i) => i.message.startsWith("No budget")).length,
      0
    );
  });

  await test("duplicate title is a warning, not an error", async () => {
    const p = await run(`${H}\nSame,S,A1,Other,B,1\nSame,S,A2,Other,B,1\n`);
    assert.ok(
      issuesOf(p, 1).some(
        (i) => i.column === "proposal_title" && i.severity === "warning"
      )
    );
    assert.ok(!issuesOf(p, 1).some((i) => i.severity === "error"));
  });

  await test("missing required column / unknown column / lone budget half", async () => {
    const p = await run(
      "proposal_title,reference_code,mystery,budget_item_1\nT,A1,x,B\n"
    );
    const msgs = p.fileIssues.map((i) => `${i.severity}:${i.message}`);
    assert.ok(msgs.some((m) => m.includes('"proposal_summary" is missing')));
    assert.ok(
      msgs.some((m) => m.startsWith("warning:") && m.includes('"mystery"'))
    );
    assert.ok(
      msgs.some((m) =>
        m.includes('"budget_item_1" has no matching "budget_amount_1"')
      )
    );
  });

  await test("round missing a field -> single round-config error, not per-row", async () => {
    const p = prepare(
      await parseCsvText(`${H}\nT,S,A1,Other,B,1\nT2,S,A2,Other,B,1\n`),
      {
        fields: fields.filter((f) => f.name !== "Priority Area"),
        existingCodes: [],
      }
    );
    assert.equal(
      p.fileIssues.filter(
        (i) => i.severity === "error" && i.message.includes("Priority Area")
      ).length,
      1
    );
    assert.ok(
      !p.rows.some((r) =>
        r.issues.some(
          (i) => i.column === "priority_area" && i.severity === "error"
        )
      )
    );
  });

  await test("template round-trips with no errors (AC 3)", async () => {
    const p = await run(buildTemplateCsv(templateBudgetPairs));
    assert.equal(p.fileIssues.filter((i) => i.severity === "error").length, 0);
    assert.equal(p.rows.length, 1);
    assert.equal(summarize(p).blocked, false);
    assert.equal(p.rows[0].totalMinor, 155050);
    assert.equal(baseColumns.length > 10, true);
  });

  const real = process.argv[2];
  if (real) {
    await test(`real file ${real}`, async () => {
      const p = await run(fs.readFileSync(real, "utf8"));
      const s = summarize(p);
      console.log("     file issues:", p.fileIssues);
      console.log(
        "     summary:",
        s,
        "budget columns:",
        p.budgetNumbers.length
      );
      const errs = p.rows.flatMap((r) =>
        r.issues
          .filter((i) => i.severity === "error")
          .map((i) => `row ${r.rowNumber} ${i.column}: ${i.message}`)
      );
      console.log("     row errors:", errs.slice(0, 15));
    });
  }

  console.log(`\n${passed} passed${process.exitCode ? ", with FAILURES" : ""}`);
}
main();
