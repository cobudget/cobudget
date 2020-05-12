import { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Avatar from "./Avatar";
import { AddIcon, DeleteIcon } from "./Icons";

const SEARCH_MEMBERS_QUERY = gql`
  query SearchMembers($eventId: ID!, $searchInput: String!) {
    members(eventId: $eventId, searchInput: $searchInput) {
      id
      isApproved
      user {
        name
        avatar
      }
    }
  }
`;

const Member = (member, add, remove) => {
  return (
    <div className="flex items-center" key={member.id}>
      <Avatar user={member.user} />
      <span className="ml-4">{member.user.name}</span>
      {add && (
        <button onClick={() => add(member.id)}>
          <AddIcon />
        </button>
      )}
      {remove && (
        <button onClick={() => remove(member.id)}>
          <DeleteIcon />
        </button>
      )}
    </div>
  );
};

const SearchMembersResult = (searchInput, eventId, addCocreator) => {
  if (!seachInput) return null;
  const {
    data: { members } = { data: { members: [] } },
  } = useQuery(SEARCH_MEMBERS_QUERY, { variables: { searchInput, eventId } });

  return (
    <div>
      {members.map((member) => (
        <Member member={member} add={addCocreator} />
      ))}
    </div>
  );
};

export default ({ event, cocreators, removeCocreator, addCocreator }) => {
  const [searchInput, setSearchInput] = useState("");

  return (
    <>
      <h3>Co-creators</h3>
      {cocreators.map((member) => (
        <Member member={member} remove={removeCocreator} />
      ))}
      <h4>Add co-creator</h4>
      <div>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <SearchMembersResult
          searchInput={searchInput}
          addCocreator={addCocreator}
          eventId={event.id}
        />
      </div>
    </>
  );
};
