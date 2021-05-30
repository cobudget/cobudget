const Terms = ({ ctx }) => {
  const { url } = ctx;
  return (
    <div>
      <div className="text-3xl text-red-600">
        Please accept the Privacy Policy and Terms and Conditions
      </div>
      <div>
        Please go to the following links to read the{" "}
        <a
          href="https://www.iubenda.com/privacy-policy/58637640"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>{" "}
        and the{" "}
        <a
          href="https://www.iubenda.com/terms-and-conditions/58637640"
          target="_blank"
          rel="noreferrer"
        >
          Terms and Conditions
        </a>
      </div>
      <form className="form-actions" action={url.loginAction} method="POST">
        <input name="accept" id="kc-accept" type="submit" value="Accept" />
        <input name="cancel" id="kc-decline" type="submit" value="Decline" />
      </form>
    </div>
  );
};

export default Terms;
