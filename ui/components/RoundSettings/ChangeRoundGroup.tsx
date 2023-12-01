import Button from "components/Button";
import HappySpinner from "components/HappySpinner";
import SelectInput, { SelectField } from "components/SelectInput";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useMutation, useQuery } from "urql";

const GET_ADMIN_GROUPS = gql`
  query Query {
    adminGroups {
      id
      slug
      name
      logo
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

function ChangeRoundGroup({ round, hide }) {
  const [{ fetching, data }] = useQuery({ query: GET_ADMIN_GROUPS });
  const [{ fetching: moving }, moveToGroup] = useMutation(MOVE_GROUP);
  const [groupId, setGroupId] = useState();
  const groups = data?.adminGroups;
  const intl = useIntl();
  const router = useRouter();

  const group = useMemo(() => {
    return groups?.find((group) => group.id === groupId);
  }, [groupId, groups]);

  const handleSubmit = async () => {
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
      const result = await moveToGroup({ roundId: round?.id, groupId });
      const { slug, group: updatedGroup } =
        result?.data?.moveRoundToGroup || {};
      if (slug && updatedGroup) {
        router.push(`/${updatedGroup.slug}/${slug}/settings/group`);
        toast.success(
          intl.formatMessage(
            { defaultMessage: "This group has been moved to {groupName}" },
            { groupName: group?.name }
          )
        );
        hide();
      } else {
        toast.error(
          intl.formatMessage({
            defaultMessage: "Error occurred while moving this round to group",
          })
        );
      }
    }
  };

  return (
    <div className="z-50 top-0 left-0 fixed w-screen h-screen bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 w-96">
        <p className="font-bold">
          <FormattedMessage defaultMessage="Move to group" />
          <span className="float-right cursor-pointer" onClick={hide}>
            ✕
          </span>
        </p>
        {fetching ? (
          <div className="flex justify-center items-center">
            <HappySpinner />
          </div>
        ) : (
          <div>
            <SelectField
              label={intl.formatMessage({ defaultMessage: "Choose a group" })}
              className="my-4"
              inputProps={{
                onChange: (e) => {
                  setGroupId(e.target.value);
                },
              }}
            >
              <option disabled selected>
                {intl.formatMessage({ defaultMessage: "Choose a group" })}
              </option>
              {groups?.map((group) => {
                return (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                );
              })}
            </SelectField>
            {group && (
              <Link href={`/${group.slug}`}>
                <a target="_blank">
                  <div className="my-4 grid grid-cols-3">
                    <div>
                      <img src={group.logo} className="w-4/5" />
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold">{group.name}</p>
                      <p>{group.slug}</p>
                    </div>
                  </div>
                </a>
              </Link>
            )}
            <div className="my-4">
              <p className="text-sm">
                <FormattedMessage defaultMessage="You can move this round to the groups where you are admin" />
              </p>
            </div>
            <div className="w-full">
              <Button
                className="w-full"
                disabled={!groupId}
                onClick={handleSubmit}
                loading={moving}
              >
                <FormattedMessage defaultMessage="Move to Group" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangeRoundGroup;
