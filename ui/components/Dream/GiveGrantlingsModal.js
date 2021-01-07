import { useForm } from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import { Modal } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Button from "components/Button";
import TextField from "components/TextField";

import { DREAM_QUERY } from "../../pages/[event]/[dream]";
import { TOP_LEVEL_QUERY } from "../../pages/_app";
const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center",
  },
}));

const GIVE_GRANT = gql`
  mutation GiveGrant($eventId: ID!, $dreamId: ID!, $value: Int!) {
    giveGrant(eventId: $eventId, dreamId: $dreamId, value: $value) {
      value
    }
  }
`;

const GiveGrantlingsModal = ({
  open,
  handleClose,
  dream,
  event,
  currentOrgMember,
}) => {
  const classes = useStyles();
  const router = useRouter();

  const dreamId = dream.id;

  const [giveGrant, { loading }] = useMutation(GIVE_GRANT, {
    update(cache, { data: { giveGrant } }) {
      const { dream } = cache.readQuery({
        query: DREAM_QUERY,
        variables: { id: dreamId },
      });

      cache.writeQuery({
        query: DREAM_QUERY,
        variables: { id: dreamId },
        data: {
          dream: {
            ...dream,
            currentNumberOfGrants:
              dream.currentNumberOfGrants + giveGrant.value,
          },
        },
      });

      const topLevelQueryData = cache.readQuery({
        query: TOP_LEVEL_QUERY,
        variables: { slug: event.slug },
      });

      cache.writeQuery({
        query: TOP_LEVEL_QUERY,
        variables: { slug: event.slug },
        data: {
          ...topLevelQueryData,
          currentOrgMember: {
            ...topLevelQueryData.currentOrgMember,
            currentEventMembership: {
              ...topLevelQueryData.currentOrgMember.currentEventMembership,
              availableGrants:
                topLevelQueryData.currentOrgMember.currentEventMembership
                  .availableGrants - giveGrant.value,
            },
          },
        },
      });
    },
  });
  const { handleSubmit, register, errors } = useForm();

  // TODO: show how many I have given to this dream
  // TODO: allow me to remove given grants

  return (
    <Modal open={open} onClose={handleClose} className={classes.modal}>
      <div className="p-5 bg-white rounded-lg shadow-md overflow-hidden outline-none">
        <h1 className="text-3xl mb-2 font-medium">Give grantlings to dream!</h1>
        <p className="text-gray-800">
          Available grants:{" "}
          {currentOrgMember.currentEventMembership.availableGrants}
        </p>
        {event.maxGrantsToDream && (
          <p className="text-sm text-gray-600 my-2">
            Max. {event.maxGrantsToDream} grants to one dream
          </p>
        )}
        <form
          onSubmit={handleSubmit((variables) => {
            giveGrant({
              variables: {
                eventId: event.id,
                dreamId: dream.id,
                value: Number(variables.value),
              },
            })
              .then((data) => {
                // Add "Snackbar" success message from material UI
                handleClose();
              })
              .catch((error) => {
                alert(error.message);
              });
          })}
        >
          <div className="my-3">
            <TextField
              name="value"
              defaultValue="1"
              inputRef={register}
              fullWidth
              size="large"
              color={event.color}
              inputProps={{
                type: "number",
                min: "1",
                max: `${
                  event.maxGrantsToDream
                    ? Math.min(
                        currentOrgMember.currentEventMembership.availableGrants,
                        event.maxGrantsToDream
                      )
                    : currentOrgMember.currentEventMembership.availableGrants
                }`,
              }}
            />
          </div>
          <Button
            type="submit"
            size="large"
            fullWidth
            color={event.color}
            loading={loading}
          >
            Donate grantlings
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default GiveGrantlingsModal;
