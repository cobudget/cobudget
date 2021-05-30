import { Button } from "@material-ui/core";

const Terms = ({ ctx }) => {
  const { url } = ctx;
  return (
    <div className="flex">
      <div className="m-auto bg-gray-200 p-6 mt-10 rounded-2xl">
        <div className="text-3xl mb-12">
          Please accept the Privacy Policy and Terms and Conditions
        </div>
        <div className="mb-12">
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
        <div className="flex">
          <form
            className="m-auto space-x-4"
            action={url.loginAction}
            method="POST"
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              name="accept"
              type="submit"
              value="Accept"
            >
              <span className="text-lg">Accept</span>
            </Button>
            <Button
              name="cancel"
              variant="contained"
              color="secondary"
              size="large"
              type="submit"
              value="Decline"
            >
              <span className="text-lg">Decline</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Terms;
