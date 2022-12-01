import React from "react";
import { FormattedMessage } from "react-intl";

function Fallback() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="flex w-screen h-screen content-center justify-center mt-2">
      <div className="w-1/2 h-1/4">
        <h2 className="text-gray-500 font-medium leading-tight text-4xl mt-0 mb-2">
          <FormattedMessage defaultMessage="Unexpected Error" />
        </h2>
        <p className="text-gray-600">
          <FormattedMessage defaultMessage="The app encountered an unexpected error. We have noted the isse and we will fix it shortly. Sorry for the inconvenience." />
        </p>
        <button
          className="mt-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
          onClick={handleReload}
        >
          <FormattedMessage defaultMessage="Reload" />
        </button>
      </div>
    </div>
  );
}

export default Fallback;
