import { useRouter } from "next/router";

function CheckMailbox() {
  const router = useRouter();
  const email = router.query.e && decodeURIComponent(router.query.e.toString());
  const code = router.query.c && decodeURIComponent(router.query.c.toString());

  return (
    <>
      <h1>Check your mailbox!</h1>
      <p>We've sent you a magic link to {email ? email : "your email"}.</p>
      <p>Click on the link to finish signing in.</p>
      {code && <p>Make sure the verification code matches {code}!</p>}
    </>
  );
}

export default CheckMailbox;
