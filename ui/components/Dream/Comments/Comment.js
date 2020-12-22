import React from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Avatar from "../../Avatar";
import { TextField, Button, IconButton } from "@material-ui/core";
import { DeleteIcon, EditIcon } from "components/Icons";
import { useForm } from "react-hook-form";
import EditComment from "./EditComment";

dayjs.extend(relativeTime);

const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($dreamId: ID!, $commentId: ID!) {
    deleteComment(dreamId: $dreamId, commentId: $commentId) {
      id
      numberOfComments
      comments {
        id
        content
        createdAt
        author {
          id
          name
          avatar
        }
      }
    }
  }
`;

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
    currentOrgMember?.currentEventMembership?.id === comment.author.id ||
    currentOrgMember?.currentEventMembership?.isAdmin;

  return (
    <div className="flex my-4">
      <div className="mr-4">
        <Avatar user={comment.author.user} />
      </div>
      <div className={`flex-grow ${showBorderBottom && "border-b"} pb-4`}>
        <div className="flex justify-between items-center mb-2 text-gray-900 font-medium text-sm">
          <h5>{comment.author.user.username}</h5>
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
            <p className="text-gray-900 whitespace-pre-line">
              {comment.content}
            </p>
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
                  className="mt-4 py-1 px-2 mr-2 flex items-center bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 hover:text-gray-700 focus:outline-none rounded-md focus:shadow-outline"
                >
                  <DeleteIcon className="w-4 h-4 mr-1" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-4 py-1 px-2 flex items-center bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 hover:text-gray-700 focus:outline-none rounded-md focus:shadow-outline"
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
