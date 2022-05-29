import React, { useState } from "react";
import { useTable } from "react-table";

function Table({ data: iData, columns }) {
	const [sortField, setSortField] = useState("");
	const [order, setOrder] = useState("asc");
	const [data, setData] = useState(iData);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
		useTable({ columns, data });

	React.useEffect(() => {
		setData(iData);
	}, [iData]);

	const handleSorting = (sortField, sortOrder) => {
		if (sortField) {
			const sorted = [...data].sort((a, b) => {
				return (
					a[sortField].toString().localeCompare(b[sortField].toString(), "en", {
						numeric: true,
					}) * (sortOrder === "asc" ? 1 : -1)
				);
			});
			setData(sorted);
		}
	};

	const handleSortingChange = (accessor) => {
		const sortOrder =
			accessor === sortField && order === "asc" ? "desc" : "asc";
		setSortField(accessor);
		setOrder(sortOrder);
		handleSorting(accessor, sortOrder);
	};

	return (
		<div className="mt-2 flex flex-col">
			<div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
				<div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
					<div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
						<table
							{...getTableProps()}
							className="min-w-full divide-y divide-gray-200"
						>
							<thead className="bg-gray-50">
								{headerGroups.map((headerGroup) => (
									<tr
										{...headerGroup.getHeaderGroupProps()}
										key={headerGroup.id}
									>
										{headerGroup.headers.map((column) => (
											<th
												onClick={() => handleSortingChange(column.id)}
												key={column.id}
												{...column.getHeaderProps()}
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												{column.render("Header")}
											</th>
										))}
									</tr>
								))}
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{rows.map((row) => {
									prepareRow(row);
									return (
										<tr {...row.getRowProps()} key={row}>
											{row.cells.map((cell) => {
												return (
													<td
														className="px-6 py-4 whitespace-nowrap"
														key={cell}
														{...cell.getCellProps()}
													>
														{cell.render("Cell")}
													</td>
												);
											})}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Table;
