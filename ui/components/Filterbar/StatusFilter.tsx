import { Popover } from "@headlessui/react";

export default function StatusFilter() {
  const rawStatus = ["PENDING_APPROVAL", "OPEN_FOR_FUNDING"];
  const status = [
    {
      type: "PENDING_APPROVAL",
      value: true,
      placeholder: "Draft",
    },
    { type: "OPEN_FOR_FUNDING", value: true, placeholder: "Open for funding" },
    { type: "FUNDED", value: true, placeholder: "Funded" },
    { type: "COMPLETED", value: false, placeholder: "Delivered" },
    { type: "CANCELED", value: false, placeholder: "Canceled" },
  ];
  return (
    <div>
      <Popover className="relative">
        <Popover.Button>Filter on Status</Popover.Button>

        <Popover.Panel className="absolute z-10 w-64 bg-white p-4 rounded-lg shadow">
          <ul>
            {status.map((status) => (
              <li>
                <input type="checkbox" checked={status.value}></input>{" "}
                {status.placeholder}
              </li>
            ))}
          </ul>
        </Popover.Panel>
      </Popover>
    </div>
  );
}
