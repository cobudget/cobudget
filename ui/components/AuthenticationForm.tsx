import { useRouter } from "next/router";
import { useState } from "react";
import TextField from "./TextField";
import Button from "./Button";

export default function AuthenticationForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { r } = router.query;
  const redirect = r?.toString();

  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault();
        setLoading(true);
        fetch(`/api/auth/magiclink`, {
          method: `POST`,
          body: JSON.stringify({
            redirect,
            destination: email,
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
      {/* @ts-ignore */}
      <TextField
        inputProps={{
          type: "email",
          value: email,
          onChange: (evt) => setEmail(evt.target.value),
        }}
        label="Email"
        className="mb-4"
        placeholder="me@hello.com"
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
  );
}
