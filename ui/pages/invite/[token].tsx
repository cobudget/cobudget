import { useEffect } from "react";
import { useRouter } from "next/router";
import { useMutation, gql } from "urql";

const JOIN_ROUND = gql`
    mutation JoinRoundInvitationLink ($token: String!) {
        joinRoundInvitationLink (token: $token) {
            id
            round {
                slug
            }
        }
    }
`;

function InviteToken () {
    const router = useRouter();
    const [{ fetching: loading, error, data }, joinRound] = useMutation(JOIN_ROUND);

    useEffect(() => {
        if (router.query.token)
        joinRound({
            token: router.query.token
        });
    }, [router.query.token]);

    useEffect(() => {
        if (data?.joinRoundInvitationLink?.id) {
            router.push({
                pathname: "/c/" + data?.joinRoundInvitationLink?.round?.slug
            })
        }
    }, [data]);

    if (error?.message) {
        return error.message;
    }

    return "Loading ..."

}

export default InviteToken;