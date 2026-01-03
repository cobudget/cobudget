import React, { useState, useEffect, useCallback } from "react";
import Modal from "@mui/material/Modal";
import Tooltip from "@tippyjs/react";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";
import { FormattedMessage } from "react-intl";

interface BucketImage {
  id?: string;
  small: string;
  large?: string;
}

interface BucketGalleryProps {
  images: BucketImage[];
  canEdit: boolean;
  openImageModal: () => void;
}

const BucketGallery: React.FC<BucketGalleryProps> = ({
  images,
  canEdit,
  openImageModal,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openCarousel = (index: number) => setSelectedIndex(index);
  const closeCarousel = () => setSelectedIndex(null);

  // Empty state
  if (images.length === 0) {
    if (!canEdit) {
      return <div className="w-full h-64 border-3 border-dashed rounded-lg" />;
    }
    return (
      <button
        onClick={openImageModal}
        className="w-full h-64 text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none hover:bg-gray-100"
      >
        <FormattedMessage defaultMessage="+ Cover image" />
      </button>
    );
  }

  const remainingImages = images.slice(1);

  return (
    <div className="relative">
      <EditButton canEdit={canEdit} onClick={openImageModal} />

      {/* Fixed-height hero - first image */}
      <HeroImage image={images[0]} onClick={() => openCarousel(0)} />

      {/* Square thumbnail grid for remaining images */}
      {remainingImages.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 mt-3">
          {remainingImages.map((img, i) => (
            <GalleryThumbnail
              key={img.id || i}
              image={img}
              onClick={() => openCarousel(i + 1)}
            />
          ))}
        </div>
      )}

      {/* Shared carousel modal */}
      <ImageCarouselModal
        images={images}
        selectedIndex={selectedIndex}
        onClose={closeCarousel}
        onNavigate={setSelectedIndex}
      />
    </div>
  );
};

// Edit button component
const EditButton: React.FC<{ canEdit: boolean; onClick: () => void }> = ({
  canEdit,
  onClick,
}) => {
  if (!canEdit) return null;

  return (
    <div className="absolute top-2 right-2 z-10">
      <Tooltip content="Edit images" placement="bottom" arrow={false}>
        <div className="bg-white/80 rounded-full">
          <IconButton onClick={onClick}>
            <EditIcon className="h-5 w-5" />
          </IconButton>
        </div>
      </Tooltip>
    </div>
  );
};

// Hero image with portrait detection for object-fit
const HeroImage: React.FC<{ image: BucketImage; onClick: () => void }> = ({
  image,
  onClick,
}) => {
  const [isPortrait, setIsPortrait] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setIsPortrait(img.naturalHeight > img.naturalWidth);
  };

  return (
    <div
      className={`
        w-full h-64 md:h-[28rem] lg:h-[32rem] rounded-lg overflow-hidden
        ${isPortrait ? "bg-gray-100" : ""}
      `}
    >
      <img
        src={image.large ?? image.small}
        alt=""
        onLoad={handleLoad}
        onClick={onClick}
        className={`
          w-full h-full cursor-pointer
          transition-shadow hover:shadow-md
          ${isPortrait ? "object-contain" : "object-cover"}
        `}
      />
    </div>
  );
};

// Square thumbnail for gallery grid
const GalleryThumbnail: React.FC<{
  image: BucketImage;
  onClick: () => void;
}> = ({ image, onClick }) => {
  return (
    <div
      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onClick}
    >
      <img src={image.small} alt="" className="w-full h-full object-cover" />
    </div>
  );
};

// Carousel modal with navigation
const ImageCarouselModal: React.FC<{
  images: BucketImage[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}> = ({ images, selectedIndex, onClose, onNavigate }) => {
  const isOpen = selectedIndex !== null;

  const goToPrev = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      onNavigate(selectedIndex - 1);
    }
  }, [selectedIndex, onNavigate]);

  const goToNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      onNavigate(selectedIndex + 1);
    }
  }, [selectedIndex, images.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToPrev, goToNext]);

  if (selectedIndex === null) return null;

  const currentImage = images[selectedIndex];
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < images.length - 1;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div
        className="absolute inset-0 flex items-center justify-center outline-none cursor-pointer"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Previous button */}
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Previous image"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Image */}
        <img
          src={currentImage.large ?? currentImage.small}
          alt=""
          onClick={(e) => e.stopPropagation()}
          className="max-h-[calc(100vh-4rem)] max-w-[calc(100vw-8rem)] rounded-lg cursor-default"
        />

        {/* Next button */}
        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Next image"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm"
          >
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BucketGallery;
