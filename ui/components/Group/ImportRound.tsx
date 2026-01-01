import Button from "components/Button";
import { SelectField } from "components/SelectInput";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useMutation, useQuery } from "urql";

const GET_ADMIN_ROUNDS = gql`
  query Query {
    adminRounds {
      id
      slug
      title
    }
  }
`;

const MOVE_GROUP = gql`
  mutation MoveRoundToGroup($roundId: ID!, $groupId: ID!) {
    moveRoundToGroup(roundId: $roundId, groupId: $groupId) {
      slug
      group {
        slug
      }
    }
  }
`;

function ImportRound({ group }) {
  const [{ fetching, data }] = useQuery({ query: GET_ADMIN_ROUNDS });
  const [{ fetching: moving }, moveToGroup] = useMutation(MOVE_GROUP);
  const [roundId, setRoundId] = useState();
  const intl = useIntl();

  const handleImport = async () => {
    if (
      window.confirm(
        intl.formatMessage(
          {
            defaultMessage:
              "Are you sure you want to move this round to {groupName}? Please note that this action is irreversible.",
          },
          { groupName: group?.name }
        )
      )
    ) {
      const result = await moveToGroup({ roundId: roundId, groupId: group.id });
      const { slug, group: updatedGroup } =
        result?.data?.moveRoundToGroup || {};
      if (slug && updatedGroup) {
        toast.success(
          intl.formatMessage(
            { defaultMessage: "This round has been moved to {groupName}" },
            { groupName: group?.name }
          )
        );
      } else {
        toast.error(
          intl.formatMessage({
            defaultMessage: "Error occurred while moving this round to group",
          })
        );
      }
    }
  };

  if (fetching || !data) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-48">
      <p className="text-center">
        <FormattedMessage defaultMessage="This group does not have any round. Import a round now." />
      </p>
      <div className="my-2 w-96">
        <SelectField
          label={""}
          className="my-4"
          inputProps={{
            onChange: (e) => {
              setRoundId(e.target.value);
            },
          }}
        >
          {data.adminRounds?.map((round) => (
            <option key={round.id} value={round.id}>
              {round.title}
            </option>
          ))}
        </SelectField>
        <Button onClick={handleImport} className="w-full" loading={moving}>
          <FormattedMessage defaultMessage={"Import"} />
        </Button>
      </div>
    </div>
  );
}

export default ImportRound;
