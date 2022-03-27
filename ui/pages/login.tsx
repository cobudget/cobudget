import { useEffect, useState } from "react";
import AuthenticationForm from "../components/AuthenticationForm";
import toast, { Toaster } from "react-hot-toast";

function Login() {
  const [fbEmailError, setFbEmailError] = useState(false);

  useEffect(() => {
    if (window.location.href.indexOf("err=INVALID_TOKEN") > -1) {
      toast.error("The magic link is invalid. Please login again.");
    }
    if (window.location.href.indexOf("err=FACEBOOK_NO_EMAIL") > -1) {
      setFbEmailError(true);
    }
  }, []);

  return (
    <div className="page">
      <Toaster />
      <h1 className="mt-10 text-gray-700 text-center text-xl font-medium">
        Login to Cobudget
      </h1>

      <div className="max-w-sm bg-white mx-auto my-6 p-6 shadow rounded">
        <AuthenticationForm />
      </div>

      {fbEmailError &&
        "To log in with Facebook, please allow us to get your email address. This is needed to notify you of important events in the app. You can always change what emails you receive from us."}
      {/* TODO: remove if env vars aren't here, altho avoid publishing secret */}
      <a
        href={`/api/auth/facebook/${
          fbEmailError ? "?fb_no_email_scope=true" : ""
        }`}
      >
        Login with facebook
      </a>
    </div>
  );
}

export default Login;
