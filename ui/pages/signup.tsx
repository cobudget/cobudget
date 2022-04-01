import AuthenticationForm from "../components/AuthenticationForm";

function Signup({ fbLoginEnabled, googleLoginEnabled }) {
  return (
    <div className="page">
      <h1 className="mt-10 text-gray-700 text-center text-xl font-medium">
        Sign up to Cobudget
      </h1>

      <div className="max-w-sm bg-white mx-auto my-6 p-6 shadow rounded">
        <AuthenticationForm
          fbLoginEnabled={fbLoginEnabled}
          googleLoginEnabled={googleLoginEnabled}
        />
      </div>
    </div>
  );
}

export default Signup;

export async function getStaticProps() {
  //getStaticProps is only serverside (build time) so this is safe
  const fbLoginEnabled = !!(
    process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET
  );

  const googleLoginEnabled = !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  return { props: { fbLoginEnabled, googleLoginEnabled } };
}
