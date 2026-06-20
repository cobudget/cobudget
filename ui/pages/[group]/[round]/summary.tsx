import { useState } from "react";
import { gql, useQuery } from "urql";
import { useRouter } from "next/router";
import SubMenu from "../../../components/SubMenu";
import PageHero from "../../../components/PageHero";
import Button from "../../../components/Button";

const ROUND_QUERY = gql`
  query SummaryRoundQuery($groupSlug: String!, $roundSlug: String!) {
    round(groupSlug: $groupSlug, roundSlug: $roundSlug) {
      id
      slug
      color
      group {
        id
        slug
      }
    }
  }
`;

const EXPORT_DATA_QUERY = gql`
  query SummaryExportData($roundId: ID!) {
    members(roundId: $roundId, isApproved: true) {
      id
      name
      email
    }
    roundTransactions(roundId: $roundId, offset: 0, limit: 9999) {
      transactions(roundId: $roundId, offset: 0, limit: 9999) {
        id
        amount
        createdAt
        transactionType
        roundMember {
          id
        }
        bucket {
          id
          title
        }
      }
    }
  }
`;

const EXPORT_TYPES = ["Per participant", "Per operation (audit log)"] as const;
type ExportType = (typeof EXPORT_TYPES)[number];

const EXPORT_DESCRIPTIONS: Record<ExportType, string> = {
  "Per participant":
    "One row per participant. Each proposal shows the final allocated balance. Enable the breakdown option to also include the peak amount each participant reached and any withdrawal from that peak.",
  "Per operation (audit log)":
    "One row per allocation or withdrawal, in chronological order. A complete record of every action taken by participants.",
};

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-anthracit ${
          checked ? "bg-anthracit" : "bg-gray-200"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}

// Amounts are stored in minor units (e.g. 50000 = 500 tokens). Divide by 100 for display.
function toDisplayAmount(minorUnits: number): number {
  return minorUnits / 100;
}

function escapeCSVField(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(csvString: string, filename: string) {
  const BOM = "﻿";
  const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildExport1(
  members: any[],
  transactions: any[],
  showName: boolean,
  showEmail: boolean,
  showBreakdown: boolean,
  roundSlug: string
) {
  // Sort contributions chronologically so we can replay the balance history
  const contributions = transactions
    .filter((t) => t.transactionType === "CONTRIBUTION")
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  // Derive sorted bucket list from contributions
  const bucketMap = new Map<string, string>(); // id → title
  for (const t of contributions) {
    if (t.bucket?.id && !bucketMap.has(t.bucket.id)) {
      bucketMap.set(t.bucket.id, t.bucket.title ?? t.bucket.id);
    }
  }
  const buckets = Array.from(bucketMap.entries()).sort((a, b) =>
    a[1].localeCompare(b[1])
  );

  // Collect ordered amounts per (memberId, bucketId)
  const amountsByCell: Record<string, Record<string, number[]>> = {};
  for (const t of contributions) {
    const mid = t.roundMember?.id;
    const bid = t.bucket?.id;
    if (!mid || !bid) continue;
    if (!amountsByCell[mid]) amountsByCell[mid] = {};
    if (!amountsByCell[mid][bid]) amountsByCell[mid][bid] = [];
    amountsByCell[mid][bid].push(t.amount);
  }

  // Replay balance history to find peak and final for a given cell.
  // Peak = highest running balance reached at any point.
  // Final = net balance after all transactions.
  // Change = Final - Peak (≤ 0; shows how much they withdrew from their peak).
  function cellStats(mid: string, bid: string) {
    const amounts = amountsByCell[mid]?.[bid] ?? [];
    let running = 0;
    let peak = 0;
    for (const a of amounts) {
      running += a;
      if (running > peak) peak = running;
    }
    return { peak, final: running, change: running - peak };
  }

  const headerCols: string[] = [];
  if (showName) headerCols.push("Name");
  if (showEmail) headerCols.push("Email");
  for (const [, title] of buckets) {
    if (showBreakdown) {
      headerCols.push(escapeCSVField(`${title} (Peak)`));
      headerCols.push(escapeCSVField(`${title} (Withdrawal)`));
    }
    headerCols.push(escapeCSVField(`${title} (Final)`));
  }

  const rows: string[] = [headerCols.join(",")];
  for (const m of members) {
    const cols: string[] = [];
    if (showName) cols.push(escapeCSVField(m.name ?? ""));
    if (showEmail) cols.push(escapeCSVField(m.email ?? ""));
    for (const [bid] of buckets) {
      const { peak, final, change } = cellStats(m.id, bid);
      if (showBreakdown) {
        cols.push(String(toDisplayAmount(peak)));
        cols.push(String(toDisplayAmount(change)));
      }
      cols.push(String(toDisplayAmount(final)));
    }
    rows.push(cols.join(","));
  }

  downloadCSV(rows.join("\r\n"), `event-${roundSlug}-per-participant.csv`);
}

function buildExport2(
  members: any[],
  transactions: any[],
  showName: boolean,
  showEmail: boolean,
  roundSlug: string
) {
  const memberMap = new Map<string, { name: string; email: string }>(
    members.map((m) => [m.id, { name: m.name ?? "", email: m.email ?? "" }])
  );

  const contributions = [...transactions]
    .filter((t) => t.transactionType === "CONTRIBUTION")
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const headerCols: string[] = [];
  if (showName) headerCols.push("Name");
  if (showEmail) headerCols.push("Email");
  headerCols.push("Proposal", "Amount", "Timestamp");

  const rows: string[] = [headerCols.join(",")];
  for (const t of contributions) {
    const member = memberMap.get(t.roundMember?.id) ?? { name: "", email: "" };
    const cols: string[] = [];
    if (showName) cols.push(escapeCSVField(member.name));
    if (showEmail) cols.push(escapeCSVField(member.email));
    cols.push(escapeCSVField(t.bucket?.title ?? ""));
    cols.push(String(toDisplayAmount(t.amount)));
    cols.push(new Date(t.createdAt).toISOString());
    rows.push(cols.join(","));
  }

  downloadCSV(rows.join("\r\n"), `event-${roundSlug}-per-operation.csv`);
}

export default function SummaryPage({ currentUser }) {
  const router = useRouter();
  const [exportType, setExportType] = useState<ExportType>(EXPORT_TYPES[0]);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [hideName, setHideName] = useState(false);
  const [hideEmail, setHideEmail] = useState(false);

  const [{ data: roundData }] = useQuery({
    query: ROUND_QUERY,
    variables: {
      groupSlug: router.query.group,
      roundSlug: router.query.round,
    },
    pause: !router.isReady,
  });

  const round = roundData?.round ?? null;

  const [{ data: exportData, fetching: exportFetching, error: exportError }] =
    useQuery({
      query: EXPORT_DATA_QUERY,
      variables: { roundId: round?.id },
      pause: !round?.id,
    });

  if (!round) return null;

  const isAdmin = currentUser?.currentCollMember?.isAdmin;

  function handleDownload() {
    if (!exportData) return;
    const {
      members,
      roundTransactions: { transactions },
    } = exportData;
    if (exportType === "Per participant") {
      buildExport1(
        members,
        transactions,
        !hideName,
        !hideEmail,
        showBreakdown,
        round.slug
      );
    } else {
      buildExport2(members, transactions, !hideName, !hideEmail, round.slug);
    }
  }

  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} round={round} />
      {isAdmin ? (
        <div className="page">
          <h1 className="text-2xl font-semibold mb-8">Summary</h1>
          <div className="max-w-lg space-y-8">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Export type
              </p>
              <div className="space-y-2">
                {EXPORT_TYPES.map((type) => (
                  <label
                    key={type}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      exportType === type
                        ? "border-anthracit bg-anthracit-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportType"
                      value={type}
                      checked={exportType === type}
                      onChange={() => setExportType(type as ExportType)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{type}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {EXPORT_DESCRIPTIONS[type]}
                      </p>
                      {type === "Per participant" &&
                        exportType === "Per participant" && (
                          <label className="flex items-center gap-2 mt-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showBreakdown}
                              onChange={(e) =>
                                setShowBreakdown(e.target.checked)
                              }
                              className="flex-shrink-0"
                            />
                            <span className="text-sm text-gray-600">
                              Include peak amount and withdrawal per proposal
                            </span>
                          </label>
                        )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Hide columns
              </p>
              <div className="space-y-3">
                <ToggleSwitch
                  checked={hideName}
                  onChange={setHideName}
                  label="Hide name"
                />
                <ToggleSwitch
                  checked={hideEmail}
                  onChange={setHideEmail}
                  label="Hide email"
                />
              </div>
            </div>

            <div>
              <Button
                onClick={handleDownload}
                loading={exportFetching}
                disabled={!exportData || exportFetching}
              >
                Download CSV
              </Button>
              {exportFetching && (
                <p className="mt-2 text-sm text-gray-500">
                  Loading event data…
                </p>
              )}
              {exportError && (
                <p className="mt-2 text-sm text-red">
                  Failed to load export data. Please reload the page and try
                  again.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <PageHero>
          <h2 className="text-2xl font-semibold">
            Admin access required to view this page.
          </h2>
        </PageHero>
      )}
    </div>
  );
}
