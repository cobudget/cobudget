import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Avatar from "./Avatar";
import AddComment from "./AddComment";

dayjs.extend(relativeTime);

const Comment = ({ comment }) => {
  return (
    <div className="flex my-4">
      <div className="mr-4">
        <Avatar user={comment.author} />
      </div>
      <div className="flex-grow border-b pb-4">
        <div className="flex justify-between mb-2 text-gray-900 font-medium text-sm">
          <h5>{comment.author.name}</h5>
          <span className="font-normal">
            {dayjs(comment.createdAt).fromNow()}
          </span>
        </div>
        <p className="text-gray-900">{comment.content}</p>
      </div>
    </div>
  );
};

const Comments = ({ currentMember, dream }) => {
  return (
    <div className="">
      {dream.comments.map((comment, index) => (
        <Comment comment={comment} key={index} />
      ))}
      {currentMember && (
        <AddComment currentMember={currentMember} dream={dream} />
      )}
    </div>
  );
};

export default Comments;
