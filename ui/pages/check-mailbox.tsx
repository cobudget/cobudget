import { useRouter } from "next/router";

function CheckMailbox() {
  const router = useRouter();
  const email = router.query.e && decodeURIComponent(router.query.e.toString());
  const code = router.query.c && decodeURIComponent(router.query.c.toString());

  return (
    <div className="page text-gray-700">
      <h1 className="text-xl font-medium">Check your mailbox!</h1>
      <p>We&apos;ve sent you a magic link to {email ? email : "your email"}.</p>
      <p>Click on the link to finish signing in.</p>
      {code && <p>Make sure the verification code matches {code}!</p>}
    </div>
  );
}

export default CheckMailbox;
