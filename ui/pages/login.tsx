import { useEffect } from "react";
import AuthenticationForm from "../components/AuthenticationForm";
import toast, { Toaster } from "react-hot-toast";

function Login() {
  useEffect(() => {
    if (window.location.href.indexOf("err=INVALID_TOKEN") > -1) {
      toast.error("The magic link is invalid. Please login again.");
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

      {/* TODO: remove if env vars aren't here, altho avoid publishing secret */}
      <a href="/api/auth/facebook/">Login with facebook</a>
    </div>
  );
}

export default Login;
