import React from "react";
import { SearchIcon, CloseIcon } from "../Icons";

export default ({ placeholder, color, clearInput, value, onChange }) => {
  return (
    <div
      className={`bg-white shadow-sm rounded-md border-transparent focus-within:border-${color} border-3 px-1 relative pr-10 flex items-center overflow-hidden`}
    >
      <input
        className="appearance-none block px-3 py-2 w-full placeholder-gray-400 text-gray-600 focus:text-gray-800 focus:outline-none"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoFocus
      />
      <button
        className={
          `h-full absolute inset-y-0 right-0 flex items-center p-3 focus:outline-none transition-colors` +
          " " +
          (value !== "" ? `bg-${color} text-white` : "text-gray-400")
        }
      >
        {value === "" ? (
          <SearchIcon className="h-5 w-5" />
        ) : (
          <CloseIcon className="h-5 w-5" onClick={clearInput} />
        )}
      </button>
    </div>
  );
};
