import AddComment from "./AddComment";
import Comment from "./Comment";

const Comments = ({
  currentOrgMember,
  currentOrg,
  comments,
  dreamId,
  event,
  logs,
}) => {
  // separate logs are deprecated, logs are now created as regular comments, but merging with them here to avoid migrations
  const items = [
    ...comments.map((comment) => ({ ...comment, _type: "COMMENT" })),
    ...logs.map((log) => ({ ...log, _type: "LOG" })),
  ].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div>
      {(comments.length > 0 || currentOrgMember?.currentEventMembership) && (
        <h2 className="mb-4 text-2xl font-medium" id="comments">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </h2>
      )}
      {items.map((comment, index) => {
        if (item._type === "LOG") return <Log log={item} key={index} />;
        return (
          <Comment
            comment={comment}
            currentOrgMember={currentOrgMember}
            dreamId={dreamId}
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
          dreamId={dreamId}
          event={event}
        />
      )}
    </div>
  );
};

export default Comments;
