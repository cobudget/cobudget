import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SearchIcon } from "../Icons";
import { SelectField } from "../SelectInput";
import StatusFilter from "./StatusFilter";
import { FormattedMessage, useIntl } from "react-intl";

const Filterbar = ({
  textSearchTerm,
  tag,
  round,
  statusFilter,
  bucketStatusCount,
  currentUser,
  view,
  sortBy,
  onChangeSortBy,
}) => {
  const intl = useIntl();
  const router = useRouter();
  const [input, setInput] = useState(textSearchTerm);
  const changed = input !== textSearchTerm;

  useEffect(() => {
    setInput(textSearchTerm);
  }, [textSearchTerm]);

  const onSubmitSearch = (e) => {
    e.preventDefault();

    router.push({
      pathname: "/[group]/[round]",
      query: {
        group: router.query.group,
        round: router.query.round,
        s: input,
        ...(tag && { tag }),
      },
    });
  };

  const onChangeTag = (e) => {
    const tag = e.target.value === "All tags" ? null : e.target.value;

    router.push({
      pathname: "/[group]/[round]",
      query: {
        group: router.query.group,
        round: router.query.round,
        ...(tag && { tag }),
        ...(!!input && { s: input }),
      },
    });
  };

  const onChangeStatus = (statusFilterArray) => {
    router.push(
      {
        pathname: "/[group]/[round]",
        query: {
          group: router.query.group,
          round: router.query.round,
          ...router.query,
          ...(tag && { tag }),
          ...(!!input && { s: input }),
          f: statusFilterArray,
        },
      },
      undefined,
      { scroll: false, shallow: true }
    );
  };
  const onChangeView = (view) => {
    router.push({
      pathname: "/[group]/[round]",
      query: {
        group: router.query.group,
        round: router.query.round,
        ...router.query,
        ...(tag && { tag }),
        ...(!!input && { s: input }),
        view,
      },
    });
  };
  if (!round) return null;

  return (
    <div className="mb-5 grid sm:flex gap-2 grid-cols-2">
      <div
        className={`bg-white shadow-sm rounded-md border-transparent focus-within:border-${round.color} border-3 px-1 relative pr-10 flex items-center overflow-hidden`}
      >
        <form onSubmit={onSubmitSearch}>
          <input
            placeholder={intl.formatMessage({ defaultMessage: "Search..." })}
            className="appearance-none block px-3 py-2 w-full placeholder-gray-400 text-gray-600 focus:text-gray-800 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className={
              `h-full absolute inset-y-0 right-0 flex items-center p-3 focus:outline-none transition-colors` +
              " " +
              (changed ? `bg-${round.color} text-white` : "text-gray-400")
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
        color={round.color}
        bucketStatusCount={bucketStatusCount}
      />

      <SelectField
        className="bg-white sm:order-3"
        color={round.color}
        inputProps={{
          value: tag || intl.formatMessage({ defaultMessage: "All tags" }),
          onChange: onChangeTag,
        }}
      >
        <option value="All tags">
          {intl.formatMessage({ defaultMessage: "All tags" })}
        </option>
        {round.tags.map((tag) => (
          <option key={tag.id} value={tag.value}>
            {tag.value}
          </option>
        ))}
      </SelectField>
      <span className="sm:order-last">
        <SelectField
          className="bg-white sm:order-3"
          color={round.color}
          inputProps={{
            value: view || intl.formatMessage({ defaultMessage: "Grid View" }),
            onChange: (e) => onChangeView(e.target.value),
          }}
        >
          <option value="grid">Grid View</option>
          <option value="table">Table View</option>
        </SelectField>
      </span>
      <span>
        <SelectField
          className="bg-white sm:order-last"
          color={round.color}
          inputProps={{
            value: sortBy,
            onChange: onChangeSortBy,
          }}
        >
          <option value="">Random</option>
          <option value="createdAt">Newest</option>
          <option value="percentageFunded">Most funded</option>
          <option value="contributionsCount">Most contributions</option>
        </SelectField>
      </span>
    </div>
  );
};

export default Filterbar;
