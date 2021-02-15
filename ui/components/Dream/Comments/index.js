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

  return (
    <div>
      {(posts.length > 0 || currentOrgMember?.currentEventMembership) && (
        <h2 className="mb-4 text-2xl font-medium" id="comments">
          {posts.length} {posts.length === 1 ? "comment" : "comments"}
        </h2>
      )}
      //TODO: clean up here, remove old logs and stuff
      {posts.map((post, index) => {
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
            comment={post}
            currentOrgMember={currentOrgMember}
            dreamId={dreamId}
            showBorderBottom={Boolean(index + 1 !== posts.length)}
            key={post.id}
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
