import AddComment from "./AddComment";
import Comment from "./Comment";

const Comments = ({ currentUser, comments, dreamId, event }) => {
  return (
    <div>
      {(comments.length > 0 || currentUser?.membership) && (
        <h2 className="mb-4 text-2xl font-medium" id="comments">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </h2>
      )}

      {comments.map((comment, index) => (
        <Comment
          comment={comment}
          currentUser={currentUser}
          dreamId={dreamId}
          showBorderBottom={Boolean(index + 1 !== comments.length)}
          key={index}
          event={event}
        />
      ))}
      {currentUser && currentUser.membership && (
        <AddComment currentUser={currentUser} dreamId={dreamId} event={event} />
      )}
    </div>
  );
};

export default Comments;
