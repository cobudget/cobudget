import { useEffect } from "react";
import HappySpinner from "components/HappySpinner";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.location = "https://www.iubenda.com/privacy-policy/58637640";
  });

  return (
    <div className="flex">
      <div className="flex m-auto mt-12 flex-col items-center">
        <div className="mb-7">Redirecting to the Privacy Policy</div>
        <HappySpinner />
      </div>
    </div>
  );
};

export default PrivacyPolicy;
