import HappySpinner from "components/HappySpinner";
import Link from "next/link";
import { FC } from "react";

type ImageFeedProps = {
  images: Array<{
    id: string;
    small?: string;
    large?: string;
    bucketId: string;
  }>;
  groupSlug: string;
  roundSlug: string;
  moreExist?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
};

const ImageFeedItem: FC<{
  image: ImageFeedProps["images"][0];
  groupSlug: string;
  roundSlug: string;
}> = ({ image, groupSlug, roundSlug }) => {
  const imageUrl = image.small || image.large;
  return (
    <Link href={`/${groupSlug}/${roundSlug}/${image.bucketId}`}>
      <a>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Bucket image"
            className="w-full rounded overflow-hidden shadow hover:shadow-lg hover:scale-105 transition-transform"
          />
        )}
      </a>
    </Link>
  );
};

const ImageFeed: FC<ImageFeedProps> = ({
  images,
  moreExist,
  onLoadMore,
  loading,
  groupSlug,
  roundSlug,
}) => {
  return (
    <>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="mb-4 animate-fadeIn"
          >
            <ImageFeedItem image={img} groupSlug={groupSlug} roundSlug={roundSlug} />
          </div>
        ))}
      </div>

      {moreExist && (
        <div className="flex justify-center py-4">
          {loading ? (
            <HappySpinner />
          ) : (
            <button
              onClick={onLoadMore}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default ImageFeed;
