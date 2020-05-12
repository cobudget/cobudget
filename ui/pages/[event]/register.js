import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Button } from "@material-ui/core";
import Router from "next/router";
import { TOP_LEVEL_QUERY } from "../_app";

const JOIN_EVENT_MUTATION = gql`
  mutation RegisterForEvent($eventId: ID!) {
    registerForEvent(eventId: $eventId) {
      isApproved
    }
  }
`;

export default ({ event, currentUser }) => {
  const [registerForEvent] = useMutation(JOIN_EVENT_MUTATION, {
    variables: { eventId: event.id },
    refetchQueries: [
      { query: TOP_LEVEL_QUERY, variables: { slug: event.slug } },
    ],
  });

  if (currentUser.membership) {
    <div>
      {currentUser.membership.isApproved
        ? "You are a member of this event."
        : "You are awaiting confirmation to join"}
    </div>;
  }

  if (!currentUser) {
    // todo: integrate this flow

    return (
      <div>
        You need to first{" "}
        <Link href="/login">
          <a>log in or sign up</a>
        </Link>{" "}
        before joining this event.
      </div>
    );
  }
  if (event.registrationPolicy === "INVITE_ONLY") {
    return <div>This event is invite only.</div>;
  }

  return (
    <div className="text-center">
      <h1 className="text-3xl mb-4">Register</h1>

      <Button
        color="primary"
        variant="contained"
        size="large"
        onClick={() =>
          registerForEvent()
            .then(({ data }) => {
              // reload queries or update cache..
              Router.push("/[event]", `/${event.slug}`);
            })
            .catch((err) => alert(err.message))
        }
      >
        {event.registrationPolicy === "REQUEST_TO_JOIN"
          ? "Request to join"
          : "Join"}
      </Button>
    </div>
  );
};
