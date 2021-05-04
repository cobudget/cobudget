import React from "react";
import { useMutation, gql } from "@apollo/client";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import relativeTime from "dayjs/plugin/relativeTime";
import Avatar from "../../Avatar";
import { DeleteIcon, EditIcon, FlagIcon } from "components/Icons";
import EditComment from "./EditComment";

dayjs.extend(relativeTime);

const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($dreamId: ID!, $commentId: ID!) {
    deleteComment(dreamId: $dreamId, commentId: $commentId) {
      id
    }
  }
`;

const LogIcon = () => (
  <div className="bg-gray-100 text-gray-700 rounded-full h-10 w-10 flex items-center justify-center">
    <FlagIcon className="h-5 w-5" />
  </div>
);

const Comment = ({
  comment,
  dreamId,
  currentOrgMember,
  showBorderBottom,
  event,
}) => {
  const [isEditMode, setEditMode] = React.useState(false);
  const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION);

  const canEdit =
    currentOrgMember &&
    (currentOrgMember?.id === comment.orgMember?.id ||
      currentOrgMember?.currentEventMembership?.isAdmin);

  return (
    <div className="flex my-4">
      <div className="mr-4">
        {comment.isLog ? (
          <LogIcon />
        ) : (
          <Avatar
            user={
              comment.orgMember?.user ?? { username: comment.discourseUsername }
            }
          />
        )}
      </div>
      <div className={`flex-grow ${showBorderBottom && "border-b"} pb-4`}>
        <div className="flex justify-between items-center mb-2 text-gray-900 font-medium text-sm">
          {comment.isLog ? (
            <h5>Log</h5>
          ) : (
            <h5>
              {comment.orgMember?.user.username ??
                `${comment.discourseUsername} (Discourse user)`}
            </h5>
          )}
          <div className="flex items-center">
            <span className="font-normal mr-2">
              {dayjs(comment.createdAt).fromNow()}
            </span>
          </div>
        </div>

        {isEditMode ? (
          <EditComment
            comment={comment}
            dreamId={dreamId}
            handleDone={() => {
              setEditMode(false);
            }}
            event={event}
          />
        ) : (
          <>
            {comment.cooked ? (
              <div
                className="text-gray-900 markdown"
                dangerouslySetInnerHTML={{ __html: comment.cooked }}
              />
            ) : (
              <ReactMarkdown source={comment.content} className="markdown" />
            )}

            {canEdit && (
              <div className="flex">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you would like to delete this comment?"
                      )
                    )
                      deleteComment({
                        variables: { dreamId, commentId: comment.id },
                      });
                  }}
                  className="mt-4 py-1 px-2 mr-2 flex items-center bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 hover:text-gray-700 focus:outline-none rounded-md focus:ring"
                >
                  <DeleteIcon className="w-4 h-4 mr-1" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-4 py-1 px-2 flex items-center bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 hover:text-gray-700 focus:outline-none rounded-md focus:ring"
                >
                  <EditIcon className="w-4 h-4 mr-1" />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Comment;
