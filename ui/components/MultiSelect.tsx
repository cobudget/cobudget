import { Popover } from "@headlessui/react";
import React from "react";

function MultiSelect({ items, onChange, value, color, label }) {
  return (
    <div>
      <Popover className="relative">
        <Popover.Button
          className={`w-full flex items-center bg-gray-100 border-3 border-gray-100 rounded py-3 px-4 pr-8 relative focus:outline-none focus:ring focus:ring-${color}`}
        >
          <div className="flex">
            {label}
            <span className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </span>
          </div>
        </Popover.Button>
        <Popover.Panel className="absolute z-10 w-56 bg-white p-4 rounded-lg shadow mt-2">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.value}>
                <label className="flex space-x-1.5 items-center">
                  <input
                    type="checkbox"
                    checked={value.includes(item.value)}
                    onChange={() => {
                      if (value.includes(item.value)) {
                        onChange(
                          value.filter((status) => status !== item.value)
                        );
                      } else {
                        onChange([...value, item.value]);
                      }
                    }}
                  ></input>
                  <span>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </Popover.Panel>
      </Popover>
    </div>
  );
}

export default MultiSelect;
