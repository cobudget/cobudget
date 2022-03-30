import AuthenticationForm from "../components/AuthenticationForm";

function Signup() {
  return (
    <div className="page">
      <h1 className="mt-10 text-gray-700 text-center text-xl font-medium">
        Sign up to {process.env.PLATFORM_NAME}
      </h1>

      <div className="max-w-sm bg-white mx-auto my-6 p-6 shadow rounded">
        <AuthenticationForm />
      </div>
    </div>
  );
}

export default Signup;
