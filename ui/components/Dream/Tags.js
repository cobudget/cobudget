import { gql, useMutation } from "urql";
import Link from "next/link";
import { CloseIcon } from "components/Icons";
import AddTag from "./AddTag";

const REMOVE_TAG_MUTATION = gql`
  mutation RemoveTag($dreamId: ID!, $tagId: ID!) {
    removeTag(dreamId: $dreamId, tagId: $tagId) {
      id
      tags {
        id
        value
      }
    }
  }
`;

export default ({ currentOrg, dream, event, canEdit }) => {
  const [, removeTag] = useMutation(REMOVE_TAG_MUTATION);

  return (
    <div className="">
      <h2 className="mb-2 font-medium hidden md:block relative">Tags</h2>

      <div className="flex items-center flex-wrap gap-3 mb-4">
        {dream.tags?.map((tag) => (
          <div
            key={tag.id}
            className="py-1 px-2 bg-gray-100 rounded flex items-center"
          >
            <Link href={`/${currentOrg.slug}/${event.slug}?tag=${tag.value}`}>
              <a className="text-gray-500 hover:text-black mr-2">{tag.value}</a>
            </Link>
            {canEdit && (
              <button
                onClick={() => removeTag({ dreamId: dream.id, tagId: tag.id })}
                className="rounded-full bg-gray-400 hover:bg-black"
              >
                <CloseIcon className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        ))}
      </div>
      {canEdit && <AddTag items={event.tags} dream={dream} />}
    </div>
  );
};
