import AddComment from "./AddComment";
import Comment from "./Comment";

const Comments = ({ currentUser, comments, dreamId }) => {
  return (
    <div>
      <h2 className="mb-1 text-2xl font-medium" id="comments">
        {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </h2>
      {comments.map((comment, index) => (
        <Comment
          comment={comment}
          currentUser={currentUser}
          dreamId={dreamId}
          showBorderBottom={Boolean(index + 1 !== comments.length)}
          key={index}
        />
      ))}
      {currentUser && currentUser.membership && (
        <AddComment currentUser={currentUser} dreamId={dreamId} />
      )}
    </div>
  );
};

export default Comments;
