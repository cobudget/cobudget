function BillBreakdown({
  parts,
  totalTitle,
  totalAmount,
}: {
  parts: any,
  totalTitle: string,
  totalAmount: string,
}) {
  return (
    <div className="border-f border-2 text-sm font-semibold">
      {
        parts.map(part => (
          <div className="border-b-2 border-f" style={{ display: "grid", gridTemplateColumns: "75% 25%" }}>
            <p className="border-r-2 border-f py-2 px-4">{part.title}</p>
            <p className="text-right py-2 px-2">{part.total}</p>
            {
              part.breakdown.map(row => (
                <>
                  <p className="border-r-2 border-f py-1 px-12 text-gray-400">
                    {row.title}
                  </p>
                  <p className="text-right py-1 px-2 text-gray-400">
                    {row.amount}
                  </p>
                </>
              ))
            }
          </div>
        ))
      }
      <div className="bg-slate-400" style={{ display: "grid", gridTemplateColumns: "75% 25%" }}>
        <p className="border-r-2 border-f p-4">{totalTitle}</p>
        <p className="text-right border-f py-4 px-2">{totalAmount}</p>
      </div>
    </div>
  );
}

export default BillBreakdown;
  