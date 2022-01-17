import React, { useState, useContext, useEffect } from "react";
import TextField from "components/TextField";
import Button from "components/Button";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";
import Context from "contexts/comment";

const schema = yup.object().shape({
  content: yup.string().required("Required"),
});

const EditComment = ({ comment, handleDone }) => {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { editComment, bucketId, collection } = useContext<any>(Context);

  const { handleSubmit, register, errors, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    register({ name: "content" });
  }, [register]);

  return (
    <form
      onSubmit={handleSubmit((vars) => {
        setSubmitting(true);
        editComment({
          bucketId,
          commentId: comment.id,
          ...vars,
        })
          .then(() => handleDone())
          .finally(() => setSubmitting(false))
          .catch((err) => alert(err.message));
      })}
    >
      <TextField
        className="mb-2"
        placeholder="Comment"
        multiline
        error={Boolean(errors.content)}
        helperText={errors.content?.message}
        defaultValue={comment.content}
        inputProps={{
          onChange: (e) => setValue("content", e.target.value),
        }}
        autoFocus
        color={collection.color}
        wysiwyg
      />
      <div className="flex justify-end">
        <Button
          onClick={handleDone}
          className="mr-2"
          variant="secondary"
          color={collection.color}
        >
          Cancel
        </Button>
        <Button type="submit" loading={submitting} color={collection.color}>
          Save
        </Button>
      </div>
    </form>
  );
};

export default EditComment;
