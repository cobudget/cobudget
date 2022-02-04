import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SearchIcon } from "../Icons";
import { SelectField } from "../SelectInput";
import StatusFilter from "./StatusFilter";

const Filterbar = ({
  textSearchTerm,
  tag,
  collection,
  currentOrg,
  statusFilter,
  bucketStatusCount,
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
      pathname: "/[org]/[collection]",
      query: {
        org: currentOrg?.slug ?? "c",
        collection: collection.slug,
        s: input,
        ...(tag && { tag }),
      },
    });
  };

  const onChangeTag = (e) => {
    const tag = e.target.value === "All tags" ? null : e.target.value;

    router.push({
      pathname: "/[org]/[collection]",
      query: {
        org: currentOrg?.slug ?? "c",
        collection: collection.slug,
        ...(tag && { tag }),
        ...(!!input && { s: input }),
      },
    });
  };

  const onChangeStatus = (statusFilterArray) => {
    router.push({
      pathname: "/[org]/[collection]",
      query: {
        org: currentOrg?.slug ?? "c",
        collection: collection.slug,
        ...(tag && { tag }),
        ...(!!input && { s: input }),
        f: statusFilterArray,
      },
    });
  };

  return (
    <div className="mb-5 grid sm:flex gap-2 grid-cols-2">
      <div
        className={`bg-white shadow-sm rounded-md border-transparent focus-within:border-${collection.color} border-3 px-1 relative pr-10 flex items-center overflow-hidden`}
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
              (changed ? `bg-${collection.color} text-white` : "text-gray-400")
            }
          >
            <SearchIcon className="h-5 w-5" />
          </button>
        </form>
      </div>

      <StatusFilter
        className="col-span-2 order-3 sm:order-2"
        onChangeStatus={onChangeStatus}
        statusFilter={statusFilter}
        color={collection.color}
        bucketStatusCount={bucketStatusCount}
      />

      <SelectField
        className="bg-white sm:order-last"
        color={collection.color}
        inputProps={{
          value: tag || "All tags",
          onChange: onChangeTag,
        }}
      >
        <option value="All tags">All tags</option>
        {collection.tags.map((tag) => (
          <option key={tag.id} value={tag.value}>
            {tag.value}
          </option>
        ))}
      </SelectField>
    </div>
  );
};

export default Filterbar;
