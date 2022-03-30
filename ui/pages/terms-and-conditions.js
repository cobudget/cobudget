const TermsAndConditions = () => {
  if (!process.env.TERMS_URL) return null;
  return (
    <div className="flex">
      <div className="flex-1 flex m-auto mt-12 flex-col items-center">
        <div className="mb-7">Terms and Conditions</div>
        <div className="flex w-full">
          <iframe
            className="flex-1 md:mx-16"
            style={{ height: "70vh" }}
            src={process.env.TERMS_URL}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
