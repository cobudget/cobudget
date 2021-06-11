import { Tooltip } from "react-tippy";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HeartOutlineIcon, CloseIcon, SearchIcon } from "../Icons";
import debounce from "../../utils/debounce";
import FilterLabels from "./FilterLabels";
import { SelectField } from "../SelectInput";

const createInputString = ({ tags, textSearchTerm }) => {
  return (
    (tags ? `#${tags.join(" #")}` : "") +
    (tags && textSearchTerm ? " " : "") +
    (textSearchTerm ? textSearchTerm : "")
  );
};

const Filterbar = ({
  textSearchTerm,
  customFields,
  filterLabels,
  setFilterLabels,
  tag,
  event,
}) => {
  const router = useRouter();
  const [input, setInput] = useState(textSearchTerm);
  const changed = input !== textSearchTerm;

  useEffect(() => {
    setInput(textSearchTerm);
  }, [textSearchTerm]);

  const onSubmitSearch = (e) => {
    e.preventDefault();

    router.push({
      pathname: "/[event]",
      query: {
        event: event.slug,
        s: input,
        ...(tag && { tag }),
      },
    });
  };

  const onChangeTag = (e) => {
    const tag = e.target.value === "All tags" ? null : e.target.value;

    router.push({
      pathname: "/[event]",
      query: {
        event: event.slug,
        ...(tag && { tag }),
        ...(!!input && { s: input }),
      },
    });
  };

  return (
    <div className="flex mb-5 items-stretch flex-wrap">
      {/* <button
        className={`bg-gray-200 hover:bg-gray-300 px-3 rounded focus:outline-none focus:ring text-gray-700 mr-2  ${
          listView ? "bg-gray-300" : ""
        }`}
        onClick={toggleListView}
      >
        <ListIcon className="h-5 w-5" />
      </button> */}

      <div
        className={`bg-white shadow-sm rounded-md border-transparent focus-within:border-${event.color} border-3 px-1 relative pr-10 mr-2 flex items-center overflow-hidden`}
      >
        <form onSubmit={onSubmitSearch}>
          <input
            placeholder="Search..."
            className="appearance-none block px-3 py-2 w-full placeholder-gray-400 text-gray-600 focus:text-gray-800 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className={
              `h-full absolute inset-y-0 right-0 flex items-center p-3 focus:outline-none transition-colors` +
              " " +
              (changed ? `bg-${event.color} text-white` : "text-gray-400")
            }
          >
            <SearchIcon className="h-5 w-5" />
          </button>
        </form>
      </div>

      <SelectField
        className="bg-white"
        color={event.color}
        inputProps={{
          value: tag || "All tags",
          onChange: onChangeTag,
        }}
      >
        <option value="All tags">All tags</option>
        {event.tags.map((tag) => (
          <option key={tag.id} value={tag.value}>
            {tag.value}
          </option>
        ))}
      </SelectField>

      <FilterLabels
        customFields={customFields}
        filterLabels={filterLabels}
        setFilterLabels={setFilterLabels}
        className={"mb-2 mt-2"}
      />
    </div>
  );
};

export default Filterbar;
