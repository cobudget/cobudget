import { useState, useEffect } from "react";
import { Badge } from "@material-ui/core";
import Avatar from "./Avatar";
import { modals } from "./Modal/index";
import Link from "next/link";

const css = {
  button:
    "text-left block mx-2 px-2 py-1 mb-1 text-gray-800 last:text-gray-500 hover:bg-gray-200 rounded-lg focus:outline-none focus:bg-gray-200",
};

const Dropdown = ({ children, open, handleClose }) => {
  // const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Esc" || e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      {open && (
        <>
          <button
            onClick={handleClose}
            tabIndex="-1"
            className="z-10 fixed inset-0 h-full w-full cursor-default"
          ></button>

          <div className="z-20 py-2 mt-1 absolute right-0 w-48 bg-white rounded-lg shadow-xl flex flex-col flex-stretch">
            {children}
          </div>
        </>
      )}
    </>
  );
};

export default Dropdown;
