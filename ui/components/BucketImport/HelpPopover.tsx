import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// A circled question mark that opens a small overlay on click and closes when
// the pointer leaves it, on a click elsewhere, or on Escape.
const HelpPopover = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        title={label}
        className="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring rounded-full"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
        </svg>
      </button>
      {open && (
        <div
          role="dialog"
          className="absolute z-30 right-0 top-full mt-1 w-80 max-w-[85vw] bg-white border border-gray-300 rounded-md shadow-lg p-4 text-sm text-left space-y-2"
        >
          {children}
        </div>
      )}
    </span>
  );
};

export default HelpPopover;
