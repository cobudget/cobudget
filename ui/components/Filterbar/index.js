import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SearchIcon } from "../Icons";
import { SelectField } from "../SelectInput";

const Filterbar = ({ textSearchTerm, tag, event }) => {
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
    </div>
  );
};

export default Filterbar;
