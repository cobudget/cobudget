import { useRouter } from "next/router";
import { useState } from "react";

export default function AuthenticationForm() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { r } = router.query;
  const redirect = r?.toString();

  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault();
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
            }
          });
      }}
    >
      <input
        type="email"
        placeholder="me@hello.com"
        value={email}
        onChange={(evt) => setEmail(evt.target.value)}
      />
      <button type="submit">Let's go!</button>
    </form>
  );
}
