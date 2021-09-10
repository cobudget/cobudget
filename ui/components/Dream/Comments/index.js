import AddComment from "./AddComment";
import Comment from "./Comment";
import Log from "./Log";

const Comments = ({ currentOrgMember, currentOrg, dream, event }) => {
  return (
    <div>
      {(dream.comments.length > 0 ||
        currentOrgMember?.currentEventMembership) && (
        <div className="flex justify-between items-center">
          <h2 className="mb-4 text-2xl font-medium" id="comments">
            {dream.comments.length}{" "}
            {dream.comments.length === 1 ? "comment" : "comments"}
          </h2>
          {dream.discourseTopicUrl && (
            <a target="_blank" rel="noreferrer" href={dream.discourseTopicUrl}>
              View on Discourse
            </a>
          )}
        </div>
      )}
      {dream.comments.map((comment, index) => {
        if (comment._type === "LOG") return <Log log={comment} key={index} />;
        return (
          <Comment
            comment={comment}
            currentOrgMember={currentOrgMember}
            dreamId={dream.id}
            showBorderBottom={Boolean(index + 1 !== dream.comments.length)}
            key={comment.id}
            event={event}
          />
        );
      })}
      {currentOrgMember && currentOrgMember?.currentEventMembership && (
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
