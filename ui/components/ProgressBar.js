const ProgressBar = ({
  ratio,
  size = "small",
  className = "",
  color = "blue",
}) => {
  return (
    <div
      className={`flex-1 bg-gray-200 rounded-full ${
        size === "large" ? "h-3" : "h-2"
      } ${className}`}
    >
      <div
        className={`bg-${color} rounded-full h-full`}
        style={{ width: `${Math.min(ratio * 100, 100)}%` }}
      />
    </div>
  );
};

export default ProgressBar;
