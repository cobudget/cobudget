import { useState } from "react";
import AddComment from "./AddComment";
import Comment from "./Comment";
import { gql, useQuery, useSubscription } from "@apollo/client";
import Log from "./Log";
import HappySpinner from "components/HappySpinner";
import { COMMENTS_QUERY, COMMENTS_CHANGED_SUBSCRIPTION } from "pages/[event]/[dream]";

const PAGE_SIZE = 3;
const Comments = ({ currentOrgMember, currentOrg, dream, event, logs }) => {
  const [from, setFrom] = useState(0);
  const [limit, setLimit] = useState(3);
  const [order, setOrder] = useState('desc');
  const [total, setTotal] = useState(0);
  const [comments, setComments] = useState([]);
  const {
    loading,
    error,
    refetch,
  } = useQuery(COMMENTS_QUERY, {
    variables: { dreamId: dream.id, from, limit, order },
    onCompleted: data => {
      setTotal(data.commentSet.total)
      setComments(data.commentSet.comments)
    }
  });

  useSubscription(COMMENTS_CHANGED_SUBSCRIPTION, {
    variables: { dreamId: dream.id },
    onSubscriptionData: () => refetch()
  });

  return (
    <div>
      {(comments.length > 0 ||
        currentOrgMember?.currentEventMembership) && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="mb-4 text-2xl font-medium" id="comments">
              {`${comments.length} of ${total} ${total === 1 ? 'comment' : 'comments'}`}
            </h2>

            {dream.discourseTopicUrl && (
              <a target="_blank" href={dream.discourseTopicUrl}>
                View on Discourse
              </a>
            )}
          </div>
          {loading && <HappySpinner size={6} />}
          {total > comments.length && !loading && <button onClick={() => setFrom(f => f + limit)}>Load more</button>}
        </>
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
