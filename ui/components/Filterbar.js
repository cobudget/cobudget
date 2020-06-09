import { Tooltip } from "react-tippy";
import { HeartOutlineIcon, HeartSolidIcon, SearchIcon } from "./Icons";
import debounce from "../utils/debounce";

export default ({
  currentUser,
  filterFavorites,
  toggleFilterFavorites,
  textSearchTerm,
  setTextSearchTerm,
}) => {
  const debouncedSearch = debounce((text) => {
    setTextSearchTerm(text);
  }, 300);

  return (
    <div className="flex mb-5 items-stretch">
      {/* <button
        className={`bg-gray-200 hover:bg-gray-300 px-3 rounded focus:outline-none focus:shadow-outline text-gray-700 mr-2  ${
          listView ? "bg-gray-300" : ""
        }`}
        onClick={toggleListView}
      >
        <ListIcon className="h-5 w-5" />
      </button> */}

      <div className="block relative mr-2">
        <span className="h-full absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-5 w-5 text-gray-600" />
        </span>
        <input
          placeholder="Search..."
          className="appearance-none bg-gray-200 rounded block pl-10 pr-6 py-2 w-full placeholder-gray-600 text-gray-800 focus:bg-white focus:text-gray-800 focus:outline-none focus:shadow-outline"
          defaultValue={textSearchTerm}
          onChange={(e) => debouncedSearch(e.target.value)}
        />
      </div>
      {currentUser && currentUser.membership && (
        <Tooltip
          title={filterFavorites ? "Show all" : "Show favorites"}
          position="bottom"
          size="small"
        >
          <button
            className={`mr-2 bg-gray-200 h-full hover:bg-gray-300 px-3 rounded focus:outline-none focus:shadow-outline text-gray-600  ${
              filterFavorites ? "bg-gray-300" : ""
            }`}
            onClick={toggleFilterFavorites}
          >
            {filterFavorites ? (
              <HeartSolidIcon className="h-5 w-5" />
            ) : (
              <HeartOutlineIcon className="h-5 w-5" />
            )}
          </button>
        </Tooltip>
      )}
    </div>
  );
};
