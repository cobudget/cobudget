import { useState } from "react";
import AddComment from "./AddComment";
import Comment from "./Comment";
import Log from "./Log";
import gql from "graphql-tag";
import { useSubscription } from "@apollo/react-hooks";

const Comments = ({
  currentOrgMember,
  currentOrg,
  dream,
  event,
  logs,
}) => {
  const [comments, setComments] = useState(dream.comments || []);

  const COMMENT_CREATED = gql`
    subscription OnCommentCreated($dreamID: ID!) {
      commentCreated(dreamID: $dreamID) {
        id
        discourseUsername
        cooked
        content
        createdAt
        isLog
        orgMember {
          id
          user {
            id
            username
            avatar
          }
        }
      }
    }
  `;

  const COMMENT_EDITED = gql`
    subscription OnCommentEdited($dreamID: ID!) {
      commentEdited(dreamID: $dreamID) {
        id
        cooked
        content
      }
    }
  `;

  const COMMENT_DELETED = gql`
    subscription OnCommentDeleted($dreamID: ID!) {
      commentDeleted(dreamID: $dreamID) {
        id
      }
    }
  `;

  useSubscription(COMMENT_CREATED, {
    variables: { dreamID: dream.id },
    onSubscriptionData: ({
      subscriptionData: { data: { commentCreated } }
    }) => setComments(comments => comments.concat(commentCreated))
  });

  useSubscription(COMMENT_EDITED, {
    variables: { dreamID: dream.id },
    onSubscriptionData: ({
      subscriptionData: { data: { commentEdited } }
    }) => setComments(current => current.map(c => c.id === commentEdited.id
      ? ({ ...c, ...commentEdited })
      : c
    ))
  });

  useSubscription(COMMENT_DELETED, {
    variables: { dreamID: dream.id },
    onSubscriptionData: ({
      subscriptionData: { data: { commentDeleted } }
    }) => setComments(comments => comments.filter(c => c.id !== commentDeleted.id))
  });

  return (
    <div>
      {(comments.length > 0 || currentOrgMember?.currentEventMembership) && (
        <div className="flex justify-between items-center">
          <h2 className="mb-4 text-2xl font-medium" id="comments">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </h2>
          {dream.discourseTopicUrl && <a target="_blank" href={dream.discourseTopicUrl}>View on Discourse</a>}
        </div>
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
