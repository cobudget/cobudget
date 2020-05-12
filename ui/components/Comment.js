import React from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Avatar from "./Avatar";
import { DeleteIcon } from "./Icons";
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

const Comment = ({ comment, dreamId, currentUser, showBorderBottom }) => {
  const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION);
  return (
    <div className="flex my-4">
      <div className="mr-4">
        <Avatar user={comment.author} />
      </div>
      <div className={`flex-grow ${showBorderBottom && "border-b"} pb-4`}>
        <div className="flex justify-between items-center mb-2 text-gray-900 font-medium text-sm">
          <h5>{comment.author.name}</h5>
          <div className="flex items-center">
            <span className="font-normal mr-2">
              {dayjs(comment.createdAt).fromNow()}
            </span>
          </div>
        </div>
        <p className="text-gray-900">{comment.content}</p>
        {currentUser &&
          (currentUser.id === comment.author.id ||
            currentUser.membership.isAdmin) && (
            <button
              onClick={() => {
                if (
                  confirm("Are you sure you would like to delete this comment?")
                )
                  deleteComment({
                    variables: { dreamId, commentId: comment.id },
                  });
              }}
              className="mt-4 py-1 px-2 flex items-center bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 hover:text-gray-700 focus:outline-none rounded-md focus:shadow-outline"
            >
              <DeleteIcon className="w-4 h-4 mr-1" />
              <span>Delete comment</span>
            </button>
          )}
      </div>
    </div>
  );
};

export default Comment;
