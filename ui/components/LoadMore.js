import HappySpinner from "components/HappySpinner";
import { CheveronDownIcon } from "components/Icons";

const LoadMore = ({ moreExist, loading, onClick }) => {
  return loading ? (
    <div className="flex-grow flex justify-center items-center h-64">
      <HappySpinner />
    </div>
  ) : (
    moreExist && (
      <button
        className="hover:bg-gray-300 p-1 m-auto mt-7 h-full rounded flex justify-center items-center focus:outline-none opacity-75"
        onClick={onClick}
      >
        <div>Load more</div>
        <CheveronDownIcon className="h-8 w-8 ml-3 p-1 text-gray-900 bg-gray-100 rounded-full" />
      </button>
    )
  );
};

export default LoadMore;
