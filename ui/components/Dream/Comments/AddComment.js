import React, { useRef, useState, useContext } from "react";
import Context from "contexts/comment";
import { useForm } from "react-hook-form";
import Link from "next/link";

import TextField from "components/TextField";
import Button from "components/Button";
import Avatar from "components/Avatar";
import toast from "react-hot-toast";

function AddComment() {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { handleSubmit, register, errors } = useForm();
  const inputRef = useRef();
  const { addComment, dream, collection, currentOrg, currentUser } = useContext(
    Context
  );
  if (
    currentOrg?.discourseUrl &&
    !currentUser.currentOrgMember?.hasDiscourseApiKey
  ) {
    return (
      <Link href={"/connect-discourse"} passHref>
        <Button color={collection.color} nextJsLink className="my-2">
          You need to connect to Discourse to comment
        </Button>
      </Link>
    );
  }
  return (
    <form
      onSubmit={handleSubmit(() => {
        setSubmitting(true);
        addComment({ bucketId: dream.id, content })
          .then(({ error }) => {
            if (error) return toast.error(error.message);
            inputRef.current.blur();
            setContent("");
          })
          .finally(() => setSubmitting(false));
      })}
    >
      <div className="flex">
        <div className="mr-4">
          <Avatar user={currentUser} />
        </div>
        <div className="flex-grow">
          <div className="mb-2">
            <TextField
              name="content"
              placeholder="Add comment"
              multiline
              rows={1}
              error={Boolean(errors.content)}
              helperText={errors.content?.message}
              value={content}
              inputProps={{
                value: content,
                onChange: (e) => setContent(e.target.value),
              }}
              inputRef={(e) => {
                register({ required: "Required" });
                inputRef.current = e;
              }}
              color={collection.color}
            />
          </div>
          {content.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={() => setContent("")}
                variant="secondary"
                color={collection.color}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={content.length === 0}
                color={collection.color}
                loading={submitting}
              >
                Submit
              </Button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

export default AddComment;
