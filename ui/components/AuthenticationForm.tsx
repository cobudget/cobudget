import { useRouter } from "next/router";
import { useState } from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import TextField from "./TextField";
import Button from "./Button";
import Banner from "components/Banner";

export default function AuthenticationForm({
  fbEmailError = false,
  fbLoginEnabled,
}: {
  fbEmailError?: boolean;
  fbLoginEnabled: boolean;
}) {
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { r } = router.query;
  const redirect = r?.toString();

  return (
    <div>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          setLoading(true);
          fetch(`/api/auth/magiclink`, {
            method: `POST`,
            body: JSON.stringify({
              redirect,
              destination: email,
              rememberMe,
            }),
            headers: { "Content-Type": "application/json" },
          })
            .then((res) => res.json())
            .then((json) => {
              if (json.success) {
                router.push(
                  `/check-mailbox?e=${encodeURIComponent(email)}&c=${json.code}`
                );
                setLoading(false);
              }
            });
        }}
      >
        <TextField
          name="email"
          inputProps={{
            type: "email",
            value: email,
            onChange: (evt) => setEmail(evt.target.value),
          }}
          label="Email"
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
          label="Keep me logged in"
        />
        <Button
          type="submit"
          fullWidth
          disabled={!email?.length}
          loading={loading}
        >
          Send magic link
        </Button>
      </form>

      <div className="w-full h-px bg-gray-300 my-5"></div>

      {fbLoginEnabled && (
        <div>
          {fbEmailError && (
            <Banner
              className={"mb-4"}
              variant="critical"
              title="Problem logging in with Facebook"
            >
              To log in with Facebook, please allow us to get your email
              address. This is needed to notify you of important events in the
              app. You can always change what emails you receive from us.
            </Banner>
          )}
          <Button
            fullWidth
            href={`/api/auth/facebook/${
              fbEmailError ? "?fb_no_email_scope=true" : ""
            }`}
            className="text-center"
            style={{ backgroundColor: "#1977f2" }}
          >
            Login with Facebook
          </Button>
        </div>
      )}
    </div>
  );
}
