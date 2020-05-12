import AddComment from "./AddComment";
import Comment from "./Comment";

const Comments = ({ currentUser, comments, dreamId }) => {
  return (
    <div>
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
