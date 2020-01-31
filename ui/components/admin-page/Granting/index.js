import { Button } from "@material-ui/core";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

const OPEN_GRANTING_MUTATION = gql`
  mutation openGranting($eventId: ID!) {
    openGranting(eventId: $eventId) {
      id
      grantingOpened
      grantingClosed
      grantingOpen
    }
  }
`;

const CLOSE_GRANTING_MUTATION = gql`
  mutation closeGranting($eventId: ID!) {
    closeGranting(eventId: $eventId) {
      id
      grantingClosed
      grantingOpen
    }
  }
`;

export default ({ event }) => {
  const [openGranting] = useMutation(OPEN_GRANTING_MUTATION);
  const [closeGranting] = useMutation(CLOSE_GRANTING_MUTATION);

  return (
    <>
      {!event.grantingOpened ? (
        <>
          Granting has not opened.
          <br />
          <Button
            color="primary"
            size="large"
            variant="contained"
            onClick={() => {
              openGranting({
                variables: { eventId: event.id }
              })
                .then(data => {
                  console.log(data);
                })
                .catch(err => console.log(err));
            }}
          >
            Open granting
          </Button>
        </>
      ) : !event.grantingClosed ? (
        <>
          Granting is <strong>open</strong>
          <br />
          <Button
            color="secondary"
            size="large"
            variant="contained"
            onClick={() => {
              closeGranting({
                variables: { eventId: event.id }
              })
                .then(data => {
                  console.log(data);
                })
                .catch(err => console.log(err));
            }}
          >
            Close granting
          </Button>
        </>
      ) : (
        <>
          Granting is <strong>closed</strong>
          <br />
          <Button
            color="secondary"
            size="large"
            onClick={() => {
              openGranting({
                variables: { eventId: event.id }
              })
                .then(data => {
                  console.log(data);
                })
                .catch(err => console.log(err));
            }}
          >
            Open granting again
          </Button>
        </>
      )}
    </>
  );
};
