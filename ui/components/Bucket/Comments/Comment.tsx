import React, { useState, useContext } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Avatar from "../../Avatar";
import { DeleteIcon, EditIcon, FlagIcon } from "components/Icons";
import EditComment from "./EditComment";
import Context from "contexts/comment";
import { LoaderIcon } from "../../Icons";
import Markdown from "components/Markdown";
import { FormattedMessage, useIntl } from "react-intl";

dayjs.extend(relativeTime);

const LogIcon = () => (
  <div className="bg-gray-100 text-gray-700 rounded-full h-10 w-10 flex items-center justify-center">
    <FlagIcon className="h-5 w-5" />
  </div>
);

const Comment = ({ comment, showBorderBottom }) => {
  const intl = useIntl();
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const { deleteComment, currentUser, bucket } = useContext<any>(Context);

  const canEdit =
    currentUser &&
    (currentUser.currentCollMember?.id === comment.roundMember?.id ||
      currentUser.currentCollMember?.isAdmin);

  return (
    <div className="flex my-4">
      <div className="mr-4">
        {comment.isLog ? (
          <LogIcon />
        ) : (
          <Avatar
            user={
              comment.roundMember?.user ?? {
                username: comment.discourseUsername,
              }
            }
          />
        )}
      </div>
      <div
        className={`flex-grow ${showBorderBottom && "border-b"} pb-4 min-w-0`}
      >
        <div className="flex justify-between items-center mb-2 text-gray-900 font-medium">
          {comment.isLog ? (
            <h5>
              <FormattedMessage defaultMessage="Log" />
            </h5>
          ) : comment.roundMember === null ? (
            <h5>
              <FormattedMessage defaultMessage="A discourse user" />
            </h5>
          ) : (
            <h5 className="font-medium">
              <span>{comment.roundMember?.user.name}</span>{" "}
              {comment.roundMember.user.username && (
                <span className="text-gray-500 font-normal">
                  @{comment.roundMember?.user.username}
                </span>
              )}
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
            handleDone={() => setEditMode(false)}
          />
        ) : (
          <>
            {comment.htmlContent ? (
              <div
                className="text-gray-900 markdown"
                dangerouslySetInnerHTML={{ __html: comment.htmlContent }}
              />
            ) : (
              <Markdown source={comment.content} enableMentions />
            )}

            {canEdit && (
              <div className="flex">
                <button
                  onClick={() =>
                    confirm(
                      intl.formatMessage({
                        defaultMessage:
                          "Are you sure you would like to delete this comment?",
                      })
                    ) &&
                    deleteComment({
                      bucketId: bucket.id,
                      commentId: comment.id,
                    }) &&
                    setSubmitting(true)
                  }
                  className="mt-4 py-1 px-2 mr-2 flex items-center bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 hover:text-gray-700 focus:outline-none rounded-md focus:ring"
                >
                  {submitting ? (
                    <LoaderIcon className="w-5 h-5 animation-spin animation-linear animation-2s" />
                  ) : (
                    <DeleteIcon className="w-4 h-4 mr-1" />
                  )}
                  <span>
                    <FormattedMessage defaultMessage="Delete" />
                  </span>
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-4 py-1 px-2 flex items-center bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 hover:text-gray-700 focus:outline-none rounded-md focus:ring"
                >
                  <EditIcon className="w-4 h-4 mr-1" />
                  <span>
                    <FormattedMessage defaultMessage="Edit" />
                  </span>
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
