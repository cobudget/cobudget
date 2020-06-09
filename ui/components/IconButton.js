export default ({
  children,
  className,
  onClick,
  tabIndex,
  type = "button",
}) => (
  <button
    className={`rounded-full p-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:shadow-outline ${className}`}
    onClick={onClick}
    tabIndex={tabIndex}
    type={type}
  >
    {children}
  </button>
);
