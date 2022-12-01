interface BillBreakdown {
  title: string;
  amount: string | React.ReactChild;
}

interface BillParts {
  title: string;
  total: string | React.ReactChild;
  breakdown: Array<BillBreakdown>;
}

function BillBreakdown({
  parts,
  totalTitle,
  totalAmount,
}: {
  parts: Array<BillParts>;
  totalTitle: string;
  totalAmount: string | React.ReactChild;
}) {
  return (
    <div className="shadow overflow-hidden">
      {parts.map((part, index) => (
        <div key={index}>
          <div className="p-4 grid grid-cols-funding bg-gray-100 even:bg-white font-medium">
            <p>{part.title}</p>
            <p>{part.total}</p>
          </div>
          {part.breakdown.map((row, index) => (
            <div
              key={index}
              className="p-4 grid grid-cols-funding bg-gray-100 even:bg-white"
            >
              <p>{row.title}</p>
              <p>{row.amount}</p>
            </div>
          ))}
        </div>
      ))}
      <div className="p-4 grid grid-cols-funding bg-gray-200 font-medium">
        <p>{totalTitle}</p>
        <p>{totalAmount}</p>
      </div>
    </div>
  );
}

export default BillBreakdown;
