import { useState, useEffect } from "react";
import AddComment from "./AddComment";
import Comment from "./Comment";
import { gql, useQuery, useSubscription, NetworkStatus } from "@apollo/client";
import Log from "./Log";
import HappySpinner from "components/HappySpinner";
import { COMMENTS_QUERY, COMMENTS_CHANGED_SUBSCRIPTION } from "pages/[event]/[dream]";

const PAGE_SIZE = 3;
const Comments = ({ currentOrgMember, currentOrg, dream, event, logs }) => {
  const [from, setFrom] = useState(0);
  const [limit, setLimit] = useState(3);
  const [order, setOrder] = useState('desc');
  const [commentSet, setCommentSet] = useState({ total: 0, comments: [] });
  const {
    data,
    loading,
    error,
    refetch,
    networkStatus,
  } = useQuery(COMMENTS_QUERY, {
    variables: { dreamId: dream.id, from, limit, order },
    notifyOnNetworkStatusChange: true
  });
  useEffect(() => {
    if (networkStatus != NetworkStatus.ready) { return; }

    setCommentSet(data.commentSet);
  }, [networkStatus]);

  useSubscription(COMMENTS_CHANGED_SUBSCRIPTION, {
    variables: { dreamId: dream.id },
    onSubscriptionData: () => refetch(),
  });

  return (
    <div>
      {(commentSet.comments.length > 0 ||
        currentOrgMember?.currentEventMembership) && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="mb-4 text-2xl font-medium" id="comments">
              {`${commentSet.comments.length} of ${commentSet.total} ${commentSet.total === 1 ? 'comment' : 'comments'}`}
            </h2>

            {dream.discourseTopicUrl && (
              <a target="_blank" href={dream.discourseTopicUrl}>
                View on Discourse
              </a>
            )}
          </div>
          {loading && <HappySpinner size={6} />}
          {commentSet.total > commentSet.comments.length && !loading && <button onClick={() => setFrom(f => f + limit)}>Load more</button>}
        </>
      )}
      {commentSet.comments.map((comment, index) => {
        if (comment._type === "LOG") return <Log log={comment} key={index} />;
        return (
          <Comment
            comment={comment}
            currentOrgMember={currentOrgMember}
            dreamId={dream.id}
            showBorderBottom={Boolean(index + 1 !== commentSet.comments.length)}
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
