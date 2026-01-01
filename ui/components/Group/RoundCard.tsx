import Link from "next/link";
import { FormattedDate, FormattedMessage } from "react-intl";
import FormattedCurrency from "components/FormattedCurrency";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DraggableIcon } from "components/Icons";

interface PreviewImage {
  id: string;
  small: string;
  large?: string;
  bucketId: string;
}

interface Round {
  id: string;
  slug: string;
  title: string;
  color: string;
  currency: string;
  position?: number;
  publishedBucketCount: number;
  bucketStatusCount?: {
    FUNDED: number;
  };
  updatedAt: string;
  distributedAmount?: number;
  previewImages?: PreviewImage[];
  group?: {
    slug: string;
  };
}

interface RoundCardProps {
  round: Round;
  balance?: number;
  showDistributedAmount?: boolean;
  bucketCountHeading: string;
  isAdmin?: boolean;
  dragHandleProps?: {
    listeners: any;
    attributes: any;
  };
}

const colorMap: Record<string, { bg: string; accent: string; text: string }> = {
  anthracit: { bg: "from-gray-700 to-gray-900", accent: "bg-gray-600", text: "text-gray-100" },
  blue: { bg: "from-blue-500 to-blue-700", accent: "bg-blue-400", text: "text-blue-100" },
  lavendel: { bg: "from-purple-400 to-purple-600", accent: "bg-purple-300", text: "text-purple-100" },
  purple: { bg: "from-violet-500 to-violet-700", accent: "bg-violet-400", text: "text-violet-100" },
  pink: { bg: "from-pink-400 to-pink-600", accent: "bg-pink-300", text: "text-pink-100" },
  red: { bg: "from-red-500 to-red-700", accent: "bg-red-400", text: "text-red-100" },
  orange: { bg: "from-orange-400 to-orange-600", accent: "bg-orange-300", text: "text-orange-100" },
  yellow: { bg: "from-amber-400 to-amber-600", accent: "bg-amber-300", text: "text-amber-100" },
  green: { bg: "from-emerald-500 to-emerald-700", accent: "bg-emerald-400", text: "text-emerald-100" },
  aqua: { bg: "from-cyan-400 to-cyan-600", accent: "bg-cyan-300", text: "text-cyan-100" },
};

function MasonryImageGrid({ images, color }: { images: PreviewImage[]; color: string }) {
  const colors = colorMap[color] || colorMap.anthracit;

  if (!images || images.length === 0) {
    // Placeholder gradient when no images
    return (
      <div className={`w-full h-48 bg-gradient-to-br ${colors.bg} rounded-t-xl flex items-center justify-center`}>
        <div className="text-white/30 text-6xl font-bold">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/>
          </svg>
        </div>
      </div>
    );
  }

  // Different layouts based on image count
  if (images.length === 1) {
    return (
      <div className="w-full h-48 rounded-t-xl overflow-hidden">
        <img
          src={images[0].small}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="w-full h-48 rounded-t-xl overflow-hidden grid grid-cols-2 gap-0.5">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.small}
            alt=""
            className="w-full h-full object-cover"
          />
        ))}
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="w-full h-48 rounded-t-xl overflow-hidden grid grid-cols-2 gap-0.5">
        <img
          src={images[0].small}
          alt=""
          className="w-full h-full object-cover row-span-2"
        />
        <div className="grid grid-rows-2 gap-0.5">
          <img src={images[1].small} alt="" className="w-full h-full object-cover" />
          <img src={images[2].small} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  if (images.length === 4) {
    return (
      <div className="w-full h-48 rounded-t-xl overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.small}
            alt=""
            className="w-full h-full object-cover"
          />
        ))}
      </div>
    );
  }

  // 5+ images: Pinterest-style masonry
  return (
    <div className="w-full h-48 rounded-t-xl overflow-hidden grid grid-cols-3 gap-0.5">
      <img
        src={images[0].small}
        alt=""
        className="w-full h-full object-cover row-span-2"
      />
      <img src={images[1].small} alt="" className="w-full h-full object-cover" />
      <img src={images[2].small} alt="" className="w-full h-full object-cover" />
      <img src={images[3].small} alt="" className="w-full h-full object-cover" />
      <div className="relative">
        <img src={images[4].small} alt="" className="w-full h-full object-cover" />
        {images.length > 5 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
            +{images.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RoundCard({
  round,
  balance,
  showDistributedAmount,
  bucketCountHeading,
  isAdmin,
  dragHandleProps,
}: RoundCardProps) {
  return (
    <div className="relative">
      {/* Drag Handle - only visible to admins */}
      {isAdmin && dragHandleProps && (
        <button
          className="absolute top-2 left-2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
          {...dragHandleProps.listeners}
          {...dragHandleProps.attributes}
          onClick={(e) => e.preventDefault()}
        >
          <DraggableIcon className="w-4 h-4 text-gray-500" />
        </button>
      )}

      <Link
        href={`/${round.group?.slug ?? "c"}/${round.slug}`}
        className="block"
      >
        <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-1">
          {/* Image Grid */}
          <MasonryImageGrid images={round.previewImages || []} color={round.color} />

          {/* Content */}
          <div className="p-5">
            {/* Title and Balance */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                {round.title}
              </h3>
              {balance ? (
                <span className="flex-shrink-0 px-2.5 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                  <FormattedCurrency value={balance} currency={round.currency} />
                </span>
              ) : null}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {bucketCountHeading}
                </span>
              </div>

              {showDistributedAmount && round.distributedAmount ? (
                <span className="text-gray-600 font-medium">
                  <FormattedCurrency
                    currency={round.currency}
                    value={round.distributedAmount}
                  />{" "}
                  <FormattedMessage defaultMessage="distributed" />
                </span>
              ) : null}
            </div>

            {/* Last Updated */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <FormattedMessage defaultMessage="Updated" />{" "}
              <FormattedDate
                value={round.updatedAt}
                day="numeric"
                month="short"
                year="numeric"
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// Sortable wrapper for drag-and-drop
interface SortableRoundCardProps extends RoundCardProps {
  id: string;
}

export function SortableRoundCard(props: SortableRoundCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <RoundCard
        {...props}
        dragHandleProps={{ listeners, attributes }}
      />
    </div>
  );
}
