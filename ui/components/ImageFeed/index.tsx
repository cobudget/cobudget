import HappySpinner from "components/HappySpinner";
import Link from "next/link";
import Masonry from "react-masonry-css";
import { FC } from "react";

const breakpointColumns = {
  default: 4,
  1024: 4,
  768: 3,
  640: 2,
  0: 1,
};

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
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Bucket image"
          className="w-full rounded overflow-hidden shadow hover:shadow-lg hover:scale-105 transition-transform"
        />
      )}
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
      <Masonry
        breakpointCols={breakpointColumns}
        className="image-feed-masonry p-4"
        columnClassName="image-feed-masonry-column"
      >
        {images.map((img) => (
          <div key={img.id} className="mb-4 animate-fadeIn">
            <ImageFeedItem
              image={img}
              groupSlug={groupSlug}
              roundSlug={roundSlug}
            />
          </div>
        ))}
      </Masonry>

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
