import React from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Avatar from "./Avatar";

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

const Comment = ({ comment, dreamId, currentMember }) => {
  const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION);
  return (
    <div className="flex my-4">
      <div className="mr-4">
        <Avatar user={comment.author} />
      </div>
      <div className="flex-grow border-b pb-4">
        <div className="flex justify-between items-center mb-2 text-gray-900 font-medium text-sm">
          <h5>{comment.author.name}</h5>
          <div className="flex items-center">
            <span className="font-normal mr-2">
              {dayjs(comment.createdAt).fromNow()}
            </span>
          </div>
        </div>
        <p className="text-gray-900">{comment.content}</p>
        {currentMember &&
          (currentMember.id === comment.author.id || currentMember.isAdmin) && (
            <button
              onClick={() => {
                if (
                  confirm("Are you sure you would like to delete this comment?")
                )
                  deleteComment({
                    variables: { dreamId, commentId: comment.id }
                  });
              }}
              className="mt-4 py-1 px-2 flex items-center bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 hover:text-gray-700 focus:outline-none rounded-md focus:shadow-outline"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span>Delete comment</span>
            </button>
          )}
      </div>
    </div>
  );
};

export default Comment;
