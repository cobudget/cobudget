import BucketImport from "components/BucketImport";
import CustomFields from "./CustomFields";

// One settings tab: the fields editor, and below it the CSV import, which is
// generated from those fields (template and column reference stay in sync).
const BucketFormAndImport = ({ round }: { round: any }) => (
  <>
    <CustomFields round={round} />
    <BucketImport round={round} embedded />
  </>
);

export default BucketFormAndImport;
