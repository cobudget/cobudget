const Switch = ({ options, selected, setSelected, className = "" }) => {
  return (
    <div className={"flex"}>
      <div
        className={
          "bg-gray-100 rounded-full flex items-center space-x-2 p-1 flex-shrink-1 " +
          className
        }
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSelected(option)}
            className={`py-2 px-5 transition-shadow rounded-full focus:outline-none focus:ring-2 ${
              selected === option
                ? "bg-white shadow-md"
                : "bg-gray-100 shadow-none text-gray-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Switch;
