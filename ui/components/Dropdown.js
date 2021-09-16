import { useEffect } from "react";

const Dropdown = ({ children, open, handleClose }) => {
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
