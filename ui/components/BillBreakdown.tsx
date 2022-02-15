function BillBreakdown({
  parts,
  totalTitle,
  totalAmount,
}: {
  parts: any;
  totalTitle: string;
  totalAmount: string;
}) {
  return (
    <div className="shadow overflow-hidden">
      {parts.map((part) => (
        <>
          <div className="p-4 grid grid-cols-funding bg-gray-100 even:bg-white font-medium">
            <p>{part.title}</p>
            <p>{part.total}</p>
          </div>
          {part.breakdown.map((row) => (
            <div className="p-4 grid grid-cols-funding bg-gray-100 even:bg-white">
              <p>{row.title}</p>
              <p>{row.amount}</p>
            </div>
          ))}
        </>
      ))}
      <div className="p-4 grid grid-cols-funding bg-gray-200 font-medium">
        <p>{totalTitle}</p>
        <p>{totalAmount}</p>
      </div>
    </div>
  );
}

export default BillBreakdown;
