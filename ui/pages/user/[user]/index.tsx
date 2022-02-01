import { useQuery, gql } from "urql";
import Avatar from "components/Avatar";

export const USER_QUERY = gql`
  query User($userId: ID!) {
    user(userId: $userId) {
      id
      username
    }
  }
`;

const UserIndex = ({ router }) => {
  const [{ data, fetching, error }] = useQuery({
    query: USER_QUERY,
    variables: { userId: router.query.user },
  });

  if (fetching) return "Loading...";
  if (error) return error.message;

  return (
    <div>
      <Avatar user={data.user} className="m-auto mt-7" />
      <div className="text-center">{data.user.username}</div>
    </div>
  );
};

export default UserIndex;
