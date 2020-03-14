import AddComment from "./AddComment";
import Comment from "./Comment";

const Comments = ({ currentMember, comments, dreamId }) => {
  return (
    <div>
      {comments.map((comment, index) => (
        <Comment
          comment={comment}
          currentMember={currentMember}
          dreamId={dreamId}
          key={index}
        />
      ))}
      {currentMember && (
        <AddComment currentMember={currentMember} dreamId={dreamId} />
      )}
    </div>
  );
};

export default Comments;
