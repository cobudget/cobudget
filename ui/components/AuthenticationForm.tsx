import { Checkbox, FormControlLabel } from "@material-ui/core";
import Banner from "components/Banner";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import Button from "./Button";
import TextField from "./TextField";

export default function AuthenticationForm({
  fbEmailError = false,
  fbLoginEnabled,
  googleLoginEnabled,
}: {
  fbEmailError?: boolean;
  fbLoginEnabled: boolean;
  googleLoginEnabled: boolean;
}) {
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { r } = router.query;
  const redirect = r?.toString();
  const intl = useIntl();

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    let captchaToken = "";
    if (process.env.SKIP_RECAPTCHA !== "true") {
      captchaToken = await window.grecaptcha.execute(
        process.env.RECAPTCHA_SITE_KEY,
        { action: "submit" }
      );
    }

    fetch(`/api/auth/magiclink`, {
      method: `POST`,
      body: JSON.stringify({
        redirect,
        destination: email,
        rememberMe,
        ...(process.env.SKIP_RECAPTCHA !== "true" && { captchaToken }),
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((json) => {
        setLoading(false);
        if (json.success) {
          router.push(
            `/check-mailbox?e=${encodeURIComponent(email)}&c=${json.code}`
          );
        } else {
          toast.error(json.error);
        }
      });
  };

  useEffect(() => {
    if (!process.env.SKIP_RECAPTCHA) {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <TextField
            name="email"
            inputProps={{
              type: "email",
              value: email,
              onChange: (evt) => setEmail(evt.target.value),
            }}
            label={intl.formatMessage({ defaultMessage: "Email" })}
            className="mb-4"
            placeholder="me@hello.com"
          />
          <FormControlLabel
            control={
              <Checkbox
                value={rememberMe}
                onChange={(evt) => setRememberMe(evt.target.checked)}
              />
            }
            label={intl.formatMessage({ defaultMessage: "Keep me logged in" })}
          />
          <Button
            type="submit"
            fullWidth
            disabled={!email?.length}
            loading={loading}
          >
            <FormattedMessage defaultMessage="Send magic link" />
          </Button>
        </form>

        {(fbLoginEnabled || googleLoginEnabled) && (
          <div className="w-full h-px bg-gray-300 my-5"></div>
        )}

        {fbLoginEnabled && (
          <div>
            {fbEmailError && (
              <Banner
                className={"mb-4"}
                variant="critical"
                title="Problem logging in with Facebook"
              >
                <FormattedMessage
                  defaultMessage="
              To log in with Facebook, please allow us to get your email
              address. This is needed to notify you of important events in the
              app. You can always change what emails you receive from us.
              "
                />
              </Banner>
            )}
            <Button
              fullWidth
              href={`/api/auth/facebook/?${
                fbEmailError ? "fb_no_email_scope=true&" : ""
              }remember_me=true&${redirect ? `r=${redirect}` : ""}`}
              className="text-center"
              style={{ backgroundColor: "#1977f2" }}
            >
              <FormattedMessage defaultMessage="Log in with Facebook" />
            </Button>
          </div>
        )}
        {googleLoginEnabled && (
          <div>
            <Button
              fullWidth
              href="/api/auth/google/?remember_me=true"
              className="mt-5 text-center shadow-lg border-default flex"
              color="white"
              variant="secondary"
            >
              <img src="/google-icon.png" className="h-8 max-w-none mr-2" />
              <FormattedMessage defaultMessage="Log in with Google" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
