import AddComment from "./AddComment";
import Comment from "./Comment";
import Log from "./Log";

const Comments = ({
  currentOrgMember,
  currentOrg,
  comments,
  logs,
  dreamId,
  event,
  posts,
}) => {
  // const items = [
  //   ...comments.map((comment) => ({ ...comment, _type: "COMMENT" })),
  //   ...logs.map((log) => ({ ...log, _type: "LOG" })),
  // ].sort((a, b) => a.createdAt - b.createdAt);

  //TODO: remove old logs, create new logs

  return (
    <div>
      {(comments.length > 0 || currentOrgMember?.currentEventMembership) && (
        <h2 className="mb-4 text-2xl font-medium" id="comments">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </h2>
      )}
      {comments.map((comment, index) => {
        // if (item._type === "COMMENT")
        //   return (
        //     <Comment
        //       comment={item}
        //       currentOrgMember={currentOrgMember}
        //       dreamId={dreamId}
        //       showBorderBottom={Boolean(index + 1 !== items.length)}
        //       key={index}
        //       event={event}
        //     />
        //   );
        // if (item._type === "LOG") return <Log log={item} key={index} />;
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
      {currentOrgMember && currentOrgMember.currentEventMembership && (
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
