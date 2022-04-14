import { useEffect } from "react";
import { useRouter } from "next/router";
import { useMutation, gql } from "urql";
import HappySpinner from "components/HappySpinner";

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
        return (
            <div className="flex justify-center mt-10">
                {
                    error?.message.indexOf("You need to be logged in to join the group") > -1 ?
                    (
                        <>
                            <p>You need to be logged in to join the round. <a href="#link" className="underline">Click here</a> to go to round page.</p>
                        </>
                    ) 
                    : error?.message
                }
            </div>
        )
    }

    return (
        <div className="flex justify-center mt-10">
            <HappySpinner />
        </div>
    )

}

export default InviteToken;