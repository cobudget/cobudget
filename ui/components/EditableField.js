import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { Tooltip } from "react-tippy";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

import TextField from "components/TextField";
import Button from "components/Button";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";

const EditableField = ({
  value,
  label,
  canEdit,
  MUTATION,
  name,
  placeholder,
  variables,
  className = "",
}) => {
  const [mutation, { loading }] = useMutation(MUTATION, {
    variables,
  });
  const { handleSubmit, register } = useForm();

  const [editing, setEditing] = useState(false);

  if (editing)
    return (
      <form
        onSubmit={handleSubmit((variables) =>
          mutation({ variables })
            .then(() => setEditing(false))
            .catch((err) => alert(err.message))
        )}
      >
        <TextField
          name={name}
          placeholder={placeholder}
          inputRef={register}
          multiline
          rows={3}
          defaultValue={value}
          autoFocus
          className="mb-2"
        />
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 font-medium pl-4">
            <a
              href="https://www.markdownguide.org/cheat-sheet/"
              target="_/blank"
              className="hover:text-gray-800 border-b hover:border-gray-800"
            >
              Markdown
            </a>{" "}
            allowed
          </div>
          <div className="flex">
            <Button
              onClick={() => setEditing(false)}
              variant="secondary"
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save
            </Button>
          </div>
        </div>
      </form>
    );
  if (value)
    return (
      <div className="relative">
        <ReactMarkdown
          source={value}
          className="markdown"
          renderers={{
            link: (props) => {
              if (props.href.includes("http"))
                return (
                  <a href={props.href} target="_blank" rel="noreferrer">
                    {props.children}
                  </a>
                );
              return (
                <Link href={props.href}>
                  <a>{props.children}</a>
                </Link>
              );
            },
          }}
        />
        {canEdit && (
          <div className="absolute top-0 right-0">
            <Tooltip title={`Edit ${name}`} position="bottom" size="small">
              <IconButton onClick={() => setEditing(true)}>
                <EditIcon className="h-6 w-6" />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    );

  return (
    <>
      {value ? (
        <ReactMarkdown source={value} className="markdown" />
      ) : (
        <button
          onClick={() => null}
          className={
            className +
            " block w-full text-gray-500 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-4"
          }
        >
          + {label}
        </button>
      )}
    </>
  );
};

export default EditableField;
