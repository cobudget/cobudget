import Link from "next/link";
import Button from "components/Button";

// Settings tab: the import preview needs the full page width, so this tab
// just explains the feature and links to the dedicated page.
const ImportBuckets = ({ round, currentGroup }) => (
  <div className="px-6 space-y-3">
    <h2 className="text-xl font-semibold">Import buckets</h2>
    <p className="text-sm text-gray-700">
      Add many buckets to this round at once from a CSV file. You get a
      validated preview before anything is created.
    </p>
    <Link href={`/${currentGroup?.slug ?? "c"}/${round.slug}/import`}>
      <a>
        <Button nextJsLink>Open the import tool</Button>
      </a>
    </Link>
  </div>
);

export default ImportBuckets;
