import { useEffect, useState } from 'react';
import AuthenticationForm from '../components/AuthenticationForm';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

function Login({ fbLoginEnabled, googleLoginEnabled }) {
  const router = useRouter();
  const [fbEmailError, setFbEmailError] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    if (window.location.href.indexOf('err=INVALID_TOKEN') > -1) {
      toast.error('The magic link is invalid. Please login again.');
    }
    if (window.location.href.indexOf('err=FACEBOOK_NO_EMAIL') > -1) {
      setFbEmailError(true);
    }
  }, []);

  useEffect(() => {
    if (router.query.error === 'invalid-token') {
      toast.error(
        intl.formatMessage({
          defaultMessage:
            'The login link is expired or is invalid. Enter your email to receive a new link',
        })
      );
    }
  }, [router.isReady, intl, router.query.error]);

  return (
    <div className="page">
      <Toaster />
      <h1 className="mt-10 text-gray-700 text-center text-xl font-medium">
        Log in to {process.env.PLATFORM_NAME}
      </h1>

      <div className="max-w-sm bg-white mx-auto my-6 p-6 shadow rounded">
        <AuthenticationForm
          fbLoginEnabled={fbLoginEnabled}
          fbEmailError={fbEmailError}
          googleLoginEnabled={googleLoginEnabled}
        />
      </div>
    </div>
  );
}

export default Login;

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
