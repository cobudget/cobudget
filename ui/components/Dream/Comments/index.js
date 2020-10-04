import AddComment from "./AddComment";
import Comment from "./Comment";
import Log from "./Log";

const Comments = ({ currentUser, comments, logs, dreamId, event }) => {
  const items = [
    ...comments.map((comment) => ({ ...comment, _type: "COMMENT" })),
    ...logs.map((log) => ({ ...log, _type: "LOG" })),
  ].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div>
      {(comments.length > 0 || currentUser?.membership) && (
        <h2 className="mb-4 text-2xl font-medium" id="comments">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </h2>
      )}

      {items.map((item, index) => {
        if (item._type === "COMMENT")
          return (
            <Comment
              comment={item}
              currentUser={currentUser}
              dreamId={dreamId}
              showBorderBottom={Boolean(index + 1 !== items.length)}
              key={index}
              event={event}
            />
          );
        if (item._type === "LOG") return <Log log={item} key={index} />;
      })}
      {currentUser && currentUser.membership && (
        <AddComment currentUser={currentUser} dreamId={dreamId} event={event} />
      )}
    </div>
  );
};

export default Comments;
