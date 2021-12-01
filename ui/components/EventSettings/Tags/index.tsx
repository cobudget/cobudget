import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import TextField from "components/TextField";
import Button from "components/Button";

const CREATE_TAG = gql`
  mutation createTag($eventId: ID!, $tagValue: String!) {
    createTag(eventId: $eventId, tagValue: $tagValue) {
      id
      tags {
        id
        value
      }
    }
  }
`;

const Tags = ({ event, currentOrg }) => {
  const {
    handleSubmit,
    reset,
    register,
    formState: { isDirty },
  } = useForm();
  const [{ fetching }, createTag] = useMutation(CREATE_TAG);

  return (
    <div className="mx-6">
      <h1 className="text-2xl font-semibold mb-6">Tags</h1>

      <div className="flex items-center flex-wrap gap-3 mb-4">
        {event.tags.map((tag) => (
          <div
            key={tag.id}
            className="py-1 px-2 bg-gray-100 rounded flex items-center"
          >
            <Link href={`/${currentOrg.slug}/${event.slug}?tag=${tag.value}`}>
              <a className="text-gray-500 hover:text-black">{tag.value}</a>
            </Link>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit((variables) => {
          createTag({
            ...variables,
            eventId: event.id,
          })
            .then(() => reset())
            .catch((error) => alert(error.message));
        })}
      >
        <TextField
          name="tagValue"
          label="Create a new tag"
          placeholder="New tag name"
          inputRef={register}
          className="my-4"
        />

        <div className="mt-2 flex justify-end">
          <Button
            color={event.color}
            type="submit"
            disabled={!isDirty}
            loading={fetching}
          >
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Tags;
