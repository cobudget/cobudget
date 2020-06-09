import Modal from "@material-ui/core/Modal";
import React, { useState } from "react";
import styled from "styled-components";
import _Card from "../styled/Card";
import { Tooltip } from "react-tippy";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";

import EditImagesModal from "./EditImagesModal";

const Card = styled(_Card)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 15px;
  outline: 0;
`;

const Gallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

const Thumb = styled.a`
  display: block;
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  background: 50% 50% no-repeat;
  background-image: url(${({ src }) => src});
  background-size: cover;
  margin-bottom: 15px;
  margin-right: 15px;
  border-radius: 5px;
`;

const Image = styled.img`
  border-radius: 5px;
  display: block;
  max-height: calc(100vh - 60px);
  max-width: calc(100vw - 60px);
`;

export default ({ dreamId, images, size, canEdit }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  return (
    <>
      <EditImagesModal
        open={editModalOpen}
        initialImages={images}
        handleClose={() => setEditModalOpen(false)}
        dreamId={dreamId}
      />
      {images.length > 0 ? (
        <div className="group relative">
          <Gallery>
            {images.map((image) => (
              <GalleryItem key={image.small} image={image} size={size} />
            ))}
          </Gallery>
          {canEdit && (
            <div className="absolute top-0 right-0 invisible group-hover:visible">
              <Tooltip title="Edit images" position="bottom" size="small">
                <IconButton onClick={() => setEditModalOpen(true)}>
                  <EditIcon className="h-6 w-6" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>
      ) : canEdit ? (
        <button
          onClick={() => setEditModalOpen(true)}
          className="h-24 w-full  text-gray-600  font-semibold rounded-lg border-3 focus:outline-none border-dashed hover:bg-gray-100 mb-4"
        >
          + Add images
        </button>
      ) : null}
    </>
  );
};

function GalleryItem({ image, size }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const close = () => setIsOpen(false);
  const open = (e) => {
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <>
      <Thumb
        href={image.large}
        onClick={open}
        size={size}
        src={image.small}
        target="_blank"
      >
        &nbsp;
      </Thumb>

      <Modal open={isOpen} onClose={close}>
        <Card>
          <Image src={image.large} />
        </Card>
      </Modal>
    </>
  );
}
