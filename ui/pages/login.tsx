import AuthenticationForm from "../components/AuthenticationForm";

function Login() {
  return (
    <div className="page">
      <h1 className="mt-10 text-gray-700 text-center text-xl font-medium">
        Login to Cobudget
      </h1>

      <div className="max-w-sm bg-white mx-auto my-6 p-6 shadow rounded">
        <AuthenticationForm />
      </div>
    </div>
  );
}

export default Login;
