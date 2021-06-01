import { useEffect } from "react";
import HappySpinner from "components/HappySpinner";

const TermsAndConditions = () => {
  useEffect(() => {
    window.location = "https://www.iubenda.com/terms-and-conditions/58637640";
  });

  return (
    <div className="flex">
      <div className="flex m-auto mt-12 flex-col items-center">
        <div className="mb-7">Redirecting to the Terms and Conditions</div>
        <HappySpinner />
      </div>
    </div>
  );
};

export default TermsAndConditions;
