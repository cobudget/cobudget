import HappySpinner from "components/HappySpinner";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { gql, useQuery } from "urql";
import ImageFeed from "../../../components/ImageFeed";
import SubMenu from "../../../components/SubMenu";
import { ROUND_QUERY } from "./about";

const RANDOM_IMAGES_QUERY = gql`
  query RoundImagesFeed(
    $groupSlug: String!
    $roundSlug: String!
    $offset: Int
    $limit: Int
  ) {
    randomRoundImages(
      groupSlug: $groupSlug
      roundSlug: $roundSlug
      offset: $offset
      limit: $limit
    ) {
      images {
        id
        small
        large
        bucketId
      }
      moreExist
    }
  }
`;

export default function ImageFeedPage() {
  const router = useRouter();
  const { group, round } = router.query;
  const [{ data: roundData, fetching: roundFetching }] = useQuery({
    query: ROUND_QUERY,
    variables: { groupSlug: group, roundSlug: round },
    pause: !router.isReady,
  });

  const [images, setImages] = useState<any[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [fetchingMore, setFetchingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [{ data, fetching }] = useQuery({
    query: RANDOM_IMAGES_QUERY,
    variables: { groupSlug: group, roundSlug: round, offset, limit: 20 },
    pause: !router.isReady,
  });

  useEffect(() => {
    if (data?.randomRoundImages && !fetching) {
      setImages((prev) =>
        offset === 0
          ? data.randomRoundImages.images
          : [...prev, ...data.randomRoundImages.images]
      );
      setFetchingMore(false);
    }
  }, [data, fetching, offset]);

  const handleLoadMore = useCallback(() => {
    if (fetchingMore) return;
    setFetchingMore(true);
    setOffset((prev) => prev + 20);
  }, [fetchingMore]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          data?.randomRoundImages?.moreExist &&
          !fetching
        ) {
          handleLoadMore();
        }
      },
      { rootMargin: "100px" }
    );

    const currentRef = loadMoreRef.current;
    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [data, fetching, handleLoadMore]);

  if (fetching && offset === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <HappySpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!roundFetching && roundData && (
        <SubMenu currentUser={null} round={roundData.round} />
      )}
      <ImageFeed
        images={images}
        moreExist={data?.randomRoundImages?.moreExist}
        onLoadMore={handleLoadMore}
        loading={fetching && fetchingMore}
        groupSlug={group as string}
        roundSlug={round as string}
      />
      {data?.randomRoundImages?.moreExist && (
        <div ref={loadMoreRef} className="h-1" />
      )}
    </div>
  );
}
