import type { ReactNode } from "react";

// A small segmented control in the round's colour: the selected option is
// filled, the others sit on a light track so they read as part of the toggle.
// `iconOnlyOnMobile` hides the label below the sm breakpoint.
const SegmentedToggle = <T extends string>({
  value,
  onChange,
  options,
  color,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: {
    value: T;
    label: string;
    icon?: ReactNode;
    iconOnlyOnMobile?: boolean;
  }[];
  color: string;
  label: string;
}) => (
  <div
    role="group"
    aria-label={label}
    className="inline-flex items-center rounded-md bg-gray-200 p-0.5 text-sm"
  >
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        aria-pressed={value === o.value}
        aria-label={o.label}
        title={o.label}
        className={`flex items-center gap-1.5 rounded px-3 py-1 focus:outline-none focus:ring ${
          value === o.value
            ? `bg-${color} text-white shadow`
            : "text-gray-700 hover:bg-gray-300"
        }`}
        onClick={() => onChange(o.value)}
      >
        {o.icon}
        <span className={o.iconOnlyOnMobile ? "hidden sm:inline" : ""}>
          {o.label}
        </span>
      </button>
    ))}
  </div>
);

export default SegmentedToggle;
