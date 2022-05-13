import { TableCell, TableRow } from "@material-ui/core";
import HappySpinner from "components/HappySpinner";
import { CheveronDownIcon } from "components/Icons";
import ReactDOM from "react-dom";

export const PortaledLoadMore = ({ children }) => {
  if (typeof window !== "undefined")
    return ReactDOM.createPortal(
      children,
      document.getElementById("load-more")
    );
  return (
    <TableRow>
      <TableCell></TableCell>
    </TableRow>
  );
};

const LoadMore = ({
  moreExist,
  loading,
  reverse,
  onClick,
}: {
  moreExist: boolean;
  loading: boolean;
  reverse?: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="mt-7">
      {loading ? (
        <div className="flex-grow flex justify-center items-center">
          <HappySpinner />
        </div>
      ) : moreExist ? (
        <button
          className="hover:bg-gray-300 p-1 m-auto h-full rounded flex justify-center items-center focus:outline-none opacity-75"
          onClick={onClick}
        >
          <div>Load more</div>
          <CheveronDownIcon
            className={`h-8 w-8 ml-3 p-1 text-gray-900 bg-gray-100 rounded-full ${
              reverse ? "transform rotate-180" : ""
            }`}
          />
        </button>
      ) : null}
    </div>
  );
};

export default LoadMore;
