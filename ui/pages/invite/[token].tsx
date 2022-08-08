import { useEffect } from "react";
import { useRouter } from "next/router";
import { useMutation, gql } from "urql";
import HappySpinner from "components/HappySpinner";

const JOIN_ROUND = gql`
  mutation JoinInvitationLink($token: String!) {
    joinInvitationLink(token: $token) {
      id
      round {
        id
        slug
      }
      group {
        id
        slug
      }
    }
  }
`;

function InviteToken() {
  const router = useRouter();
  const [{ error, data }, joinRound] = useMutation(JOIN_ROUND);

  useEffect(() => {
    if (router.query.token)
      joinRound({
        token: router.query.token,
      });
  }, [router.query.token, joinRound]);

  useEffect(() => {
    if (data?.joinInvitationLink?.id) {
      if (data?.joinInvitationLink?.group?.slug) {
        router.push({
          pathname: "/" + data?.joinInvitationLink?.group?.slug,
        });
      } else {
        window.alert(1);
        router.push({
          pathname: "/c/" + data?.joinInvitationLink?.round?.slug,
        });
      }
    }
  }, [data, router]);

  useEffect(() => {
    if (
      error?.message.indexOf("You need to be logged in to join the group") > -1
    ) {
      router.push("/login?r=/invite/" + router.query.token);
    }
  }, [error, router.query, router]);

  if (error?.message) {
    return (
      <div className="flex justify-center mt-10">
        {error?.message.indexOf("You need to be logged in to join the group") >
        -1 ? (
          <>
            <p>
              You need to be logged in to join the round.{" "}
              <a href="#link" className="underline">
                Click here
              </a>{" "}
              to go to round page.
            </p>
          </>
        ) : error?.message.indexOf("Invalid invitation link") > -1 ? (
          <>
            <p>This invitation link is not valid</p>
          </>
        ) : error?.message.indexOf("Round link expired") > -1 ? (
          <>
            <p>This invitation link is expired</p>
          </>
        ) : (
          error?.message
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-10">
      <HappySpinner />
    </div>
  );
}

export default InviteToken;
