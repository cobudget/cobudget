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
  normalizeCode,
  templateBudgetPairs,
} from "../utils/bucketImport/config";
import { buildColumns } from "../utils/bucketImport/columns";
import { generateImportKey, validateImportKey } from "../utils/fieldKey";
import { roundFieldPresetCreateData } from "../server/services/roundFieldPreset";
import { validateImportPayload } from "../utils/bucketImport/validatePayload";
import type { ImportFieldDef } from "../utils/bucketImport/types";
import {
  buildTemplateCsv,
  parseAmountToMinor,
  parseCsvText,
  prepareImport as prepare,
  summarize,
} from "../utils/bucketImport/prepareImport";
import { applyImages } from "../utils/bucketImport/images";
import {
  createLimiter,
  fileStem,
  matchFiles,
} from "../utils/bucketImport/matchImages";

// Arbitrary field set (deliberately NOT the Give it a Go fields): the importer
// must work for whatever the round's custom fields are.
const AREAS = ["Green Economy", "Community", "Other"];
const mk = (
  id: string,
  name: string,
  type: string,
  importKey: string | null,
  extra: Partial<ImportFieldDef> = {}
): ImportFieldDef => ({
  id,
  name,
  type,
  importKey,
  options: [],
  limit: null,
  isRequired: false,
  isUniqueIdentifier: false,
  ...extra,
});
const fields: ImportFieldDef[] = [
  mk("f-area", "Area", "TEXT", "area", { options: AREAS }),
  mk("f-ref", "Ref", "TEXT", "ref", { isUniqueIdentifier: true }),
  mk("f-notes", "Notes", "MULTILINE_TEXT", "notes", { limit: 50 }),
  mk("f-ok", "Approved", "BOOLEAN", "approved"),
  mk("f-file", "Attachment", "FILE", "attachment"),
  mk("f-nokey", "Legacy", "TEXT", null),
];

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
  const H = "title,summary,ref,area,budget-item-1,budget-amount-1";

  await test("applyImages: upload clears the warning, uploading blocks, error keeps the row", async () => {
    const p = await run(`${H}
A,s,A1,Green Economy,Beds,100
B,s,B1,Green Economy,Beds,100
C,s,C1,Green Economy,Beds,100
`);
    // images are never read from the CSV: every row starts with the warning
    p.rows.forEach((r, i) => {
      assert.ok(issuesOf(p, i).some((x) => x.column === "image"));
      assert.deepEqual(r.payload.images, []);
    });
    const a = applyImages(p, {
      1: {
        status: "done",
        fileName: "a.png",
        attempt: 1,
        small: "s1",
        large: "l1",
      },
      2: {
        status: "done",
        fileName: "b.png",
        attempt: 2,
        small: "s2",
        large: "l2",
      },
      3: { status: "uploading", fileName: "c.png", attempt: 3 },
    });
    assert.deepEqual(a.rows[0].payload.images, [{ small: "s1", large: "l1" }]);
    assert.equal(
      a.rows[0].issues.filter((i) => i.column === "image").length,
      0
    );
    assert.ok(summarize(a).blocked === true); // row 3 still uploading
    assert.ok(
      a.rows[2].issues.some((i) => i.message.includes("still uploading"))
    );
    const err = applyImages(p, {
      3: { status: "error", fileName: "c.png", attempt: 1, error: "nope" },
    });
    assert.deepEqual(err.rows[2].payload.images, []);
    assert.ok(err.rows[2].issues.some((i) => i.column === "image"));
    assert.equal(p.rows[0].payload.images?.length, 0); // input not mutated
  });

  await test("matchFiles: code, then title slug, then order number; never guesses", () => {
    const rows = [
      { rowNumber: 1, uniqueValue: "GF01", title: "Community Garden" },
      { rowNumber: 2, uniqueValue: "GF02", title: "Café & Bar" },
      { rowNumber: 3, uniqueValue: "GF03", title: "Shared Title" },
      { rowNumber: 4, uniqueValue: "GF04", title: "Shared Title" },
      { rowNumber: 5, uniqueValue: "GF05", title: "Pond Project" },
      { rowNumber: 7, uniqueValue: "", title: "Seven" },
    ];
    const f = (name: string) => ({ id: name, name });
    assert.equal(fileStem("pics/gf01.Final.PNG"), "gf01.final");
    const r = matchFiles(
      [
        f("gf01.png"), // code, case-insensitive
        f("Café-and-Bar.JPG"), // title slug
        f("pond project.png"), // title slug, spaces
        f("7.jpeg"), // order number
        f("shared-title.png"), // two rows share the title
        f("nothing.png"), // no match
        f("gf03.png"), // code match
        f("GF03.jpg"), // same row claimed twice
        f("2.png"), // number 2 = same row as the café file: a clash
      ],
      rows
    );
    const by = (id: string) => r.assigned.find((a) => a.fileId === id);
    assert.deepEqual(by("gf01.png"), {
      fileId: "gf01.png",
      rowNumber: 1,
      by: "code",
    });
    assert.equal(by("Café-and-Bar.JPG"), undefined); // clashes with 2.png
    assert.equal(by("pond project.png")?.by, "title");
    assert.equal(by("7.jpeg")?.by, "number");
    assert.equal(by("2.png"), undefined);
    const amb = (id: string) => r.ambiguous.find((a) => a.fileId === id);
    assert.equal(amb("shared-title.png")?.reason, "multiple-rows");
    assert.deepEqual(amb("shared-title.png")?.candidates, [3, 4]);
    assert.equal(amb("2.png")?.reason, "multiple-files");
    assert.equal(amb("Café-and-Bar.JPG")?.by, "title");
    assert.equal(amb("gf03.png")?.reason, "multiple-files");
    assert.equal(amb("GF03.jpg")?.reason, "multiple-files");
    assert.deepEqual(r.unmatched, ["nothing.png"]);
    // an occupied row is a conflict, not a silent replace
    const o = matchFiles([f("gf01.png")], rows, new Set([1]));
    assert.equal(o.assigned.length, 0);
    assert.equal(o.ambiguous[0].reason, "row-has-image");
    // blank reference codes never match an empty-ish stem
    assert.equal(matchFiles([f(".png")], rows).unmatched.length, 1);
  });

  await test("createLimiter never exceeds its limit and finishes everything", async () => {
    const run = createLimiter(3);
    let active = 0;
    let peak = 0;
    const out = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        run(async () => {
          active++;
          peak = Math.max(peak, active);
          await new Promise((res) => setTimeout(res, 5));
          active--;
          return i;
        })
      )
    );
    assert.deepEqual(out, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.equal(peak, 3);
    await assert.rejects(
      run(() => Promise.reject(new Error("x"))),
      /x/
    );
    assert.equal(await run(async () => 1), 1); // a failure frees its slot
  });

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
      `\uFEFF${H}\r\n"Title, with comma","Line1\r\nLine2 ""quoted""",A1,Green Economy,Beds,100\r\n`
    );
    assert.equal(t.headers[0], "title");
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
    assert.equal(t.headers[0], "title");
    assert.equal(t.rows.length, 1);
  });

  await test("clean row has no issues except missing image warning", async () => {
    const p = await run(`${H}\nT,S,A1,Green Economy,Beds,100\n`);
    // only the note about fields without a column (FILE type, no key)
    assert.equal(p.fileIssues.length, 1);
    assert.ok(p.fileIssues[0].message.includes("Attachment, Legacy"));
    assert.deepEqual(
      issuesOf(p, 0).map((i) => i.severity),
      ["warning"]
    );
    assert.equal(p.rows[0].totalMinor, 10000);
  });

  await test("22+ budget items, non-contiguous numbers, uses real N", async () => {
    const heads = Array.from(
      { length: 25 },
      (_, i) => `budget-item-${i + 1},budget-amount-${i + 1}`
    );
    const vals = Array.from({ length: 25 }, (_, i) =>
      i % 2 ? "," : `Item ${i + 1},10`
    );
    const p = await run(
      `title,summary,ref,${heads.join(",")}\nT,S,A1,${vals.join(",")}\n`
    );
    assert.equal(p.budgetNumbers.length, 25);
    assert.equal(p.rows[0].payload.budgetItems.length, 13);
    assert.equal(p.rows[0].totalMinor, 13 * 1000);
  });

  await test("budget gap: an empty line before a filled one is a warning on that line", async () => {
    const p = await run(
      "title,summary,ref,budget-item-1,budget-amount-1,budget-item-2,budget-amount-2,budget-item-3,budget-amount-3\n" +
        "T,S,A1,One,10,,,Three,30\n" +
        "T2,S,A2,One,10,Two,20,,\n"
    );
    const gap = p.rows[0].issues.filter((i) => i.column === "budget-item-2");
    assert.equal(gap.length, 1);
    assert.equal(gap[0].severity, "warning");
    assert.equal(p.rows[0].payload.budgetItems.length, 2); // still imported
    assert.equal(
      p.rows[1].issues.filter((i) => i.column?.startsWith("budget-")).length,
      0
    ); // trailing empty lines are fine
  });

  await test("no budget items: the warning is on the budget cell", async () => {
    const p = await run(
      "title,summary,ref,budget-item-1,budget-amount-1\nT,S,A1,,\n"
    );
    const w = p.rows[0].issues.find((i) => i.message.startsWith("No budget"));
    assert.equal(w?.column, "budget-item-1");
    assert.equal(w?.severity, "warning");
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
    assert.ok(at(0, "title", "error"));
    assert.ok(at(1, "summary", "error"));
    assert.ok(at(2, "area", "error"));
    assert.ok(at(3, "budget-amount-1", "error"));
    assert.ok(at(5, "ref", "error"), "dup code flagged on second row");
    assert.ok(at(6, "ref", "error"), "dup vs existing");
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
        (i) => i.column === "title" && i.severity === "warning"
      )
    );
    assert.ok(!issuesOf(p, 1).some((i) => i.severity === "error"));
  });

  await test("missing required column / unknown column / lone budget half", async () => {
    const p = await run("title,ref,mystery,budget-item-1\nT,A1,x,B\n");
    const msgs = p.fileIssues.map((i) => `${i.severity}:${i.message}`);
    assert.ok(msgs.some((m) => m.includes('"summary" is missing')));
    assert.ok(
      msgs.some((m) => m.startsWith("warning:") && m.includes('"mystery"'))
    );
    assert.ok(
      msgs.some((m) =>
        m.includes('"budget-item-1" has no matching "budget-amount-1"')
      )
    );
  });

  await test("template round-trips with no errors (AC 3)", async () => {
    const p = await run(buildTemplateCsv(fields, templateBudgetPairs));
    assert.equal(p.fileIssues.filter((i) => i.severity === "error").length, 0);
    assert.equal(p.rows.length, 1);
    assert.equal(summarize(p).blocked, false);
    assert.equal(p.rows[0].totalMinor, 470800); // sample proposal: Venue hire 4708
  });

  await test("every row sharing a code is flagged, fixing one clears both", async () => {
    const p = await run(`${H}
A,S,DUP,Other,B,1
B,S,dup,Other,B,1
C,S,OK1,Other,B,1
`);
    const flagged = (pp: typeof p, r: number) =>
      issuesOf(pp, r).some((i) => i.kind === "duplicateCode");
    assert.ok(flagged(p, 0) && flagged(p, 1) && !flagged(p, 2));
    assert.equal(summarize(p).duplicateCodeRows, 2);
    const fixed = await run(`${H}
A,S,DUP,Other,B,1
B,S,DUP2,Other,B,1
`);
    assert.equal(summarize(fixed).duplicateCodeRows, 0);
  });

  await test("existing-in-round rows are tagged for the remove action", async () => {
    const p = await run(
      `${H}
A,S,OLD,Other,B,1
B,S,NEW,Other,B,1
`,
      ["old"]
    );
    assert.equal(summarize(p).existingCodeRows, 1);
    assert.ok(issuesOf(p, 0).some((i) => i.kind === "existingCode"));
  });

  await test("row numbers stay stable when rows are removed", async () => {
    const t = await parseCsvText(`${H}
A,S,X,Other,B,1
B,S,X,Other,B,1
`);
    const p = prepare(
      { headers: t.headers, rows: [t.rows[1]], rowNumbers: [2] },
      { fields, existingCodes: [] }
    );
    assert.equal(p.rows[0].rowNumber, 2);
    const q = prepare(
      { headers: t.headers, rows: [t.rows[0], t.rows[1]], rowNumbers: [3, 7] },
      { fields, existingCodes: [] }
    );
    assert.ok(q.rows[0].issues.some((i) => i.message.includes("rows 3, 7")));
  });

  await test("cells keep what was typed (no trimming) but payload is trimmed", async () => {
    const p = await run(`${H}
"  spaced out ",S,A1,Other,B,1
`);
    assert.equal(p.rows[0].cells.title, "  spaced out ");
    assert.equal(p.rows[0].payload.title, "spaced out");
  });

  // ---- field-driven columns ------------------------------------------------
  const other: ImportFieldDef[] = [
    mk("g-code", "Grant code", "TEXT", "grant-code", {
      isUniqueIdentifier: true,
      isRequired: true,
    }),
    mk("g-type", "Type", "ENUM", "type", {
      options: ["Small", "Large"],
      isRequired: true,
    }),
    mk("g-urgent", "Urgent?", "BOOLEAN", "urgent"),
  ];
  const runWith = async (
    f: ImportFieldDef[],
    text: string,
    existing: string[] = []
  ) =>
    prepare(await parseCsvText(text), { fields: f, existingCodes: existing });

  await test("columns = built-ins + importable keyed fields (no hardcoded names)", () => {
    assert.deepEqual(
      buildColumns(fields).map((c) => c.column),
      ["title", "summary", "area", "ref", "notes", "approved"]
    );
    assert.deepEqual(
      buildColumns(other).map((c) => c.column),
      ["title", "summary", "grant-code", "type", "urgent"]
    );
    const ref = buildColumns(fields).find((c) => c.column === "ref");
    assert.equal(ref.required, true); // unique identifier is always required
    assert.equal(ref.unique, true);
  });

  await test("another field set: template round-trips, enum/boolean/required/unique", async () => {
    const tpl = buildTemplateCsv(other, templateBudgetPairs);
    assert.ok(tpl.startsWith('"title","summary","grant-code","type","urgent"'));
    const p = await runWith(other, tpl);
    assert.equal(p.fileIssues.filter((i) => i.severity === "error").length, 0);
    assert.equal(summarize(p).blocked, false);
    assert.deepEqual(p.rows[0].payload.fieldValues, [
      { fieldId: "g-code", value: "EX01" },
      { fieldId: "g-type", value: "Small" },
      { fieldId: "g-urgent", value: true },
    ]);
    assert.equal(p.rows[0].uniqueValue, "EX01");

    const bad = await runWith(
      other,
      "title,summary,grant-code,type,urgent,budget-item-1,budget-amount-1\n" +
        "A,S,G1,Huge,maybe,B,1\n" +
        "B,S,,Small,no,B,1\n"
    );
    const at = (r: number, col: string) =>
      bad.rows[r].issues.some(
        (i) => i.column === col && i.severity === "error"
      );
    assert.ok(at(0, "type"), "enum value");
    assert.ok(at(0, "urgent"), "boolean parse");
    assert.ok(at(1, "grant-code"), "unique value is non-empty");
    assert.equal(
      bad.rows[1].payload.fieldValues.find((v) => v.fieldId === "g-urgent")
        .value,
      false
    );
  });

  await test("required field / unique column missing from the file is one file error", async () => {
    const p = await runWith(
      other,
      "title,summary,budget-item-1,budget-amount-1\nA,S,B,1\n"
    );
    const errs = p.fileIssues
      .filter((i) => i.severity === "error")
      .map((i) => i.message);
    assert.ok(errs.some((m) => m.includes('"grant-code"')));
    assert.ok(errs.some((m) => m.includes('"type"')));
    assert.ok(!errs.some((m) => m.includes('"urgent"'))); // optional
  });

  await test("no unique field: import allowed, no uniqueness check, a note only", async () => {
    const f = other.map((x) => ({ ...x, isUniqueIdentifier: false }));
    const p = await runWith(
      f,
      "title,summary,grant-code,type,budget-item-1,budget-amount-1\nA,S,SAME,Small,B,1\nB,S,SAME,Large,B,1\n",
      ["same"]
    );
    assert.equal(p.fileIssues.filter((i) => i.severity === "error").length, 0);
    assert.ok(
      p.fileIssues.some(
        (i) =>
          i.severity === "warning" && i.message.includes("no unique-identifier")
      )
    );
    assert.equal(
      summarize(p).duplicateCodeRows + summarize(p).existingCodeRows,
      0
    );
    assert.equal(summarize(p).blocked, false);
    assert.equal(p.rows[0].uniqueValue, "");
  });

  await test("unique check follows the flagged field, whatever its name", async () => {
    const p = await runWith(
      other,
      "title,summary,grant-code,type,budget-item-1,budget-amount-1\nA,S,Q1,Small,B,1\nB,S,q1,Large,B,1\nC,S,OLD,Small,B,1\n",
      ["old"]
    );
    assert.equal(summarize(p).duplicateCodeRows, 2);
    assert.equal(summarize(p).existingCodeRows, 1);
    assert.ok(
      p.rows[0].issues.some(
        (i) => i.kind === "duplicateCode" && i.column === "grant-code"
      )
    );
  });

  await test("server validation: flagged non-TEXT field is a round error; payload uses ids not names", () => {
    const bad = other.map((x) =>
      x.id === "g-code" ? { ...x, type: "MULTILINE_TEXT" } : x
    );
    const v = validateImportPayload(
      [{ title: "T", fieldValues: [], budgetItems: [] }],
      { fields: bad, existingCodes: new Set() }
    );
    assert.ok(
      v.errors.some((e) => e.row === null && e.message.includes("single-line"))
    );
    const ok = validateImportPayload(
      [
        {
          title: "T",
          fieldValues: [
            { fieldId: "g-code", value: "Z" },
            { fieldId: "g-type", value: "Small" },
          ],
          budgetItems: [{ description: "x", amount: 1 }],
        },
      ],
      { fields: other, existingCodes: new Set() }
    );
    assert.deepEqual(ok.errors, []);
  });

  await test("importKey: slug, hyphens, cap, de-dup, reserved names", () => {
    assert.equal(generateImportKey("Priority Area", []), "priority-area");
    assert.equal(
      generateImportKey("Key Fund’s Comments!", []),
      "key-funds-comments"
    );
    assert.equal(
      generateImportKey("Reference Code", ["reference-code"]),
      "reference-code-2"
    );
    assert.equal(
      generateImportKey("Reference Code", [
        "reference-code",
        "reference-code-2",
      ]),
      "reference-code-3"
    );
    assert.equal(generateImportKey("日本語", []), "field");
    for (const n of ["Title", "Summary", "Image"])
      assert.equal(generateImportKey(n, []), n.toLowerCase() + "-field");
    const long = "A very long question that goes on and on and on forever?";
    const k = generateImportKey(long, []);
    assert.ok(k.length <= 40 && !k.endsWith("-"), k);
    const k2 = generateImportKey(long, [k]);
    assert.ok(k2.length <= 40 && k2 !== k && k2.endsWith("-2"), k2);
    assert.equal(validateImportKey("budget-item-3") !== null, true);
    assert.equal(validateImportKey("title") !== null, true);
    assert.equal(validateImportKey("Has Space") !== null, true);
    assert.equal(validateImportKey("x".repeat(41)) !== null, true);
    assert.equal(validateImportKey("ok-key_1"), null);
  });

  await test("default preset: valid unique keys, one unique TEXT field, template round-trips", async () => {
    const data = roundFieldPresetCreateData();
    const keys = data.map((f) => f.importKey);
    assert.equal(new Set(keys).size, keys.length);
    keys.forEach((k) => assert.equal(validateImportKey(k), null, k));
    const flagged = data.filter((f) => f.isUniqueIdentifier);
    assert.equal(flagged.length, 1);
    assert.equal(flagged[0].type, "TEXT");
    assert.equal(
      data.find((f) => f.name === "Priority Area").options.length,
      9
    );
    const defs = data.map((f, i) => ({ ...f, id: "p" + i, limit: null }));
    const p = await runWith(defs, buildTemplateCsv(defs, templateBudgetPairs));
    assert.equal(p.fileIssues.filter((i) => i.severity === "error").length, 0);
    assert.equal(summarize(p).blocked, false);
    // the template's example row is the sample proposal (GF10 Hydrology)
    assert.equal(p.rows[0].uniqueValue, "GF10");
    assert.equal(p.rows[0].payload.title, "Hydrology");
    assert.equal(p.rows[0].totalMinor, 470800);
    assert.equal(p.rows[0].payload.fieldValues.length, 11);
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
