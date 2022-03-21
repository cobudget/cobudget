import React, { useRef, useState, useContext, useEffect } from "react";
import Context from "contexts/comment";
import { useForm } from "react-hook-form";
import Link from "next/link";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";

import TextField from "components/TextField";
import Button from "components/Button";
import Avatar from "components/Avatar";
import toast from "react-hot-toast";

const schema = yup.object().shape({
  content: yup.string().required("Required"),
});

function AddComment() {
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<any>();
  const {
    addComment,
    bucketId,
    round,
    currentGroup,
    currentUser,
  } = useContext<any>(Context);

  const { handleSubmit, register, errors, setValue, watch } = useForm({
    resolver: yupResolver(schema),
  });
  const content = watch("content", "");

  useEffect(() => {
    register({ name: "content" });
  }, [register]);

  if (
    currentGroup?.discourseUrl &&
    !currentUser.currentGroupMember?.hasDiscourseApiKey
  ) {
    return (
      <Link href={"/connect-discourse"} passHref>
        <Button color={round.color} nextJsLink className="my-2">
          You need to connect to Discourse to comment
        </Button>
      </Link>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((vars) => {
        setSubmitting(true);
        addComment({ bucketId, ...vars })
          .then(({ error }) => {
            if (error) return toast.error(error.message);
            inputRef.current.blur();
            inputRef.current.clear();
          })
          .finally(() => setSubmitting(false));
      })}
    >
      <div className="flex">
        <div className="mr-4">
          <Avatar user={currentUser} />
        </div>
        <div className="min-w-0">
          <div className="mb-2">
            <TextField
              placeholder="Add comment"
              multiline
              rows={1}
              error={Boolean(errors.content)}
              helperText={errors.content?.message}
              inputProps={{
                onChange: (e) => setValue("content", e.target.value),
              }}
              inputRef={(e) => {
                inputRef.current = e;
              }}
              color={round.color}
              wysiwyg
              enableMentions
              mentionsCollId={round.id}
            />
          </div>
          {content.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={inputRef.current.clear}
                variant="secondary"
                color={round.color}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={content.length === 0}
                color={round.color}
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
