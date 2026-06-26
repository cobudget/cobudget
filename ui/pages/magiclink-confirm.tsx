import { useEffect } from "react";
import { useRouter } from "next/router";
import { LoaderIcon } from "components/Icons";

function MagiclinkConfirm() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const token = router.query.token;
    if (!token) {
      router.replace("/login?error=invalid-token");
      return;
    }
    window.location.replace(
      `/api/auth/magiclink/callback?token=${encodeURIComponent(token as string)}`
    );
  }, [router.isReady, router.query.token]);

  return (
    <div className="page flex flex-col items-center justify-center text-gray-500">
      <LoaderIcon className="animate-spin" width={32} height={32} />
      <p className="mt-4">Signing you in…</p>
    </div>
  );
}

export default MagiclinkConfirm;
