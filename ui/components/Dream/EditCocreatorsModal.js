import { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Avatar from "../Avatar";
import { AddIcon, DeleteIcon } from "../Icons";
import { Modal } from "@material-ui/core";

const SEARCH_MEMBERS_QUERY = gql`
  query SearchMembers($eventId: ID!, $isApproved: Boolean) {
    members(eventId: $eventId, isApproved: $isApproved) {
      id
      isApproved
      orgMember {
        user {
          id
          username
          avatar
        }
      }
    }
  }
`;

const ADD_CO_CREATOR_MUTATION = gql`
  mutation AddCocreator($dreamId: ID!, $memberId: ID!) {
    addCocreator(dreamId: $dreamId, memberId: $memberId) {
      id
      cocreators {
        id
        orgMember {
          user {
            id
            username
            avatar
          }
        }
      }
    }
  }
`;

const REMOVE_CO_CREATOR_MUTATION = gql`
  mutation RemoveCocreator($dreamId: ID!, $memberId: ID!) {
    removeCocreator(dreamId: $dreamId, memberId: $memberId) {
      id
      cocreators {
        id
        orgMember {
          user {
            id
            username
            avatar
          }
        }
      }
    }
  }
`;

const Member = ({ member, add, remove }) => {
  return (
    <div className="flex items-center justify-between mb-2 overflow-y-scroll ">
      <div className="flex items-center">
        <Avatar user={member.orgMember.user} size="small" />
        <span className="ml-2 text-gray-800">
          {member.orgMember.user.username}
        </span>
      </div>
      <div className="flex items-center">
        {Boolean(add) && (
          <button
            onClick={add}
            className="rounded-full p-1 hover:bg-gray-200 focus:outline-none focus:shadow-outline text-gray-800"
          >
            <AddIcon className="w-6 h-6" />
          </button>
        )}
        {Boolean(remove) && (
          <button
            onClick={remove}
            className="rounded-full p-1 hover:bg-gray-200 focus:outline-none focus:shadow-outline text-gray-800"
          >
            <DeleteIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

const SearchMembersResult = ({
  searchInput,
  cocreators,
  eventId,
  addCocreator,
}) => {
  const { data: { members } = { members: [] }, loading, error } = useQuery(
    SEARCH_MEMBERS_QUERY,
    {
      variables: { eventId, isApproved: true },
    }
  );

  const cocreatorIds = cocreators.map((cocreator) => cocreator.id);

  // remove already added co-creators
  let result = members.filter((member) => !cocreatorIds.includes(member.id));

  if (searchInput) {
    result = result.filter((member) =>
      member.orgMember.user.username
        ?.toLowerCase()
        .includes(searchInput.toLowerCase())
    );
  }

  return (
    <div>
      {result.map((member) => (
        <Member
          key={member.id}
          member={member}
          add={() =>
            addCocreator({ variables: { memberId: member.id } }).catch((err) =>
              alert(err.message)
            )
          }
        />
      ))}
    </div>
  );
};

export default ({
  open,
  handleClose,
  dream,
  event,
  cocreators,
  currentOrgMember,
}) => {
  const [searchInput, setSearchInput] = useState("");

  const [addCocreator] = useMutation(ADD_CO_CREATOR_MUTATION, {
    variables: { dreamId: dream.id },
  });
  const [removeCocreator] = useMutation(REMOVE_CO_CREATOR_MUTATION, {
    variables: { dreamId: dream.id },
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex items-start justify-center p-4 md:pt-16 overflow-y-scroll max-h-screen"
    >
      <div className="bg-white rounded shadow p-6 grid grid-cols-2 gap-4 focus:outline-none">
        <div className="border-r pr-4">
          <h2 className="font-medium mb-2">Co-creators</h2>
          {cocreators.map((member) => (
            <Member
              key={member.id}
              member={member}
              remove={() => {
                if (
                  member.id !== currentOrgMember.currentEventMembership.id ||
                  confirm(
                    "Are you sure you would like to remove yourself? This can't be undone (unless you are admin/guide)"
                  )
                ) {
                  removeCocreator({
                    variables: { memberId: member.id },
                  }).catch((err) => alert(err.message));
                }
              }}
            />
          ))}
        </div>
        <div>
          <h2 className="font-medium mb-2">Add co-creator</h2>
          <div>
            <input
              value={searchInput}
              placeholder="Filter by name..."
              className="bg-gray-200 rounded py-2 px-3 mb-4 focus:outline-none focus:shadow-outline focus:bg-white"
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <SearchMembersResult
              searchInput={searchInput}
              addCocreator={addCocreator}
              cocreators={cocreators}
              eventId={event.id}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
