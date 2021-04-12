import AddComment from "./AddComment";
import Comment from "./Comment";
import Log from "./Log";
import gql from "graphql-tag";
import { useSubscription } from "@apollo/react-hooks";

const Comments = ({
  currentOrgMember,
  currentOrg,
  dream,
  event,
  logs,
}) => {
  // separate logs are deprecated, logs are now created as regular comments, but merging with them here to avoid migrations
  // const items = [
  //   ...comments.map((comment) => ({ ...comment, _type: "COMMENT" })),
  //   ...logs.map((log) => ({ ...log, _type: "LOG" })),
  // ].sort((a, b) => a.createdAt - b.createdAt);

  const COMMENTS_SUBSCRIPTION = gql`
    subscription OnCommentsChanged($dreamID: ID!) {
      commentsChanged(dreamID: $dreamID) {
        id
        comments {
          id
          discourseUsername
          cooked
          content
          createdAt
          isLog
          orgMember {
            id
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

  const { data, error, loading } = useSubscription(
    COMMENTS_SUBSCRIPTION,
    { variables: { dreamID: dream.id }
  });
  console.log(data, error, loading);
  const comments = [];

  return (
    <div>
      {(comments.length > 0 || currentOrgMember?.currentEventMembership) && (
        <div className="flex justify-between items-center">
          <h2 className="mb-4 text-2xl font-medium" id="comments">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </h2>
          {dream.discourseTopicUrl && <a target="_blank" href={dream.discourseTopicUrl}>View on Discourse</a>}
        </div>
      )}
      {comments.map((comment, index) => {
        if (comment._type === "LOG") return <Log log={comment} key={index} />;
        return (
          <Comment
            comment={comment}
            currentOrgMember={currentOrgMember}
            dreamId={dream.id}
            showBorderBottom={Boolean(index + 1 !== comments.length)}
            key={comment.id}
            event={event}
          />
        );
      })}
      {currentOrgMember && (
        <AddComment
          currentOrgMember={currentOrgMember}
          currentOrg={currentOrg}
          dreamId={dream.id}
          event={event}
        />
      )}
    </div>
  );
};

export default Comments;
