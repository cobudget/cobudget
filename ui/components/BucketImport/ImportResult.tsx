import Link from "next/link";
import Button from "components/Button";

type Created = { id: string; title: string };

const ImportResult = ({
  created,
  base,
  onAnother,
}: {
  created: Created[];
  base: string;
  onAnother: () => void;
}) => (
  <div className="bg-white rounded-lg shadow p-6 space-y-4">
    <h2 className="text-xl font-semibold text-green-800">
      Imported {created.length} bucket{created.length === 1 ? "" : "s"}
    </h2>
    <p className="text-sm text-gray-700">
      They are published and open for funding. No notification emails were sent.
    </p>
    <div className="flex gap-2">
      <Link href={base}>
        <a>
          <Button nextJsLink>Go to the round</Button>
        </a>
      </Link>
      <Button variant="secondary" onClick={onAnother}>
        Import another file
      </Button>
    </div>
    <ol className="list-decimal ml-5 text-sm space-y-1">
      {created.map((b) => (
        <li key={b.id}>
          <Link href={`${base}/${b.id}`}>
            <a className="underline">{b.title}</a>
          </Link>
        </li>
      ))}
    </ol>
  </div>
);

export default ImportResult;
