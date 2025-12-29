import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Masonry from "react-masonry-css";
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

const masonryBreakpoints = {
  default: 3,
  768: 2,
};

const BucketGallery: React.FC<BucketGalleryProps> = ({
  images,
  canEdit,
  openImageModal,
}) => {
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
      <HeroImage image={images[0]} />

      {/* Masonry for remaining images */}
      {remainingImages.length > 0 && (
        <Masonry
          breakpointCols={masonryBreakpoints}
          className="bucket-gallery-masonry mt-3"
          columnClassName="bucket-gallery-masonry-column"
        >
          {remainingImages.map((img, i) => (
            <div key={img.id || i} className="mb-3">
              <GalleryImage image={img} />
            </div>
          ))}
        </Masonry>
      )}
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
const HeroImage: React.FC<{ image: BucketImage }> = ({ image }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setIsPortrait(img.naturalHeight > img.naturalWidth);
  };

  return (
    <>
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
          onClick={() => setIsOpen(true)}
          className={`
            w-full h-full cursor-pointer
            transition-shadow hover:shadow-md
            ${isPortrait ? "object-contain" : "object-cover"}
          `}
        />
      </div>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 outline-none p-4">
          <img
            src={image.large ?? image.small}
            alt=""
            className="max-h-[calc(100vh-4rem)] max-w-[calc(100vw-4rem)] rounded-lg"
          />
        </div>
      </Modal>
    </>
  );
};

// Regular gallery image with lightbox
const GalleryImage: React.FC<{ image: BucketImage }> = ({ image }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img
        src={image.large ?? image.small}
        alt=""
        onClick={() => setIsOpen(true)}
        className="w-full h-auto rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      />

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 outline-none p-4">
          <img
            src={image.large ?? image.small}
            alt=""
            className="max-h-[calc(100vh-4rem)] max-w-[calc(100vw-4rem)] rounded-lg"
          />
        </div>
      </Modal>
    </>
  );
};

export default BucketGallery;
