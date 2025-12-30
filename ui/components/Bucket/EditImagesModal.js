import { useState } from "react";
import { useMutation, gql } from "urql";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { FormattedMessage, useIntl } from "react-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Modal } from "@mui/material";

import Button from "components/Button";
import { DraggableIcon } from "components/Icons";

const Images = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;

  input[type="file"] {
    visibility: hidden;
    position: absolute;
    top: -500px;
  }
  label {
    border: 2px dashed lightgrey;
    color: grey;
    height: 140px;
    width: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    cursor: pointer;
    flex-shrink: 0;
    &:hover {
      border-color: grey;
    }
  }
`;

const EDIT_IMAGES_MUTATION = gql`
  mutation EDIT_IMAGES($bucketId: ID!, $images: [ImageInput]) {
    editBucket(bucketId: $bucketId, images: $images) {
      id
      images {
        small
        large
      }
    }
  }
`;

// prevent saving null values to images.
const removeNullValues = (images) =>
  images.map(({ small, large }) => ({
    ...(small && { small }),
    ...(large && { large }),
  }));

// Sortable image component
const SortableImage = ({ image, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.small });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <a href={image.large} target="_blank" rel="noreferrer">
        <img
          src={image.small}
          alt="Preview"
          className="h-[140px] w-[140px] object-cover object-center rounded-md"
        />
      </a>
      {/* Delete button */}
      <button
        type="button"
        className="absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-gray-100"
        onClick={() => onRemove(index)}
      >
        ×
      </button>
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="absolute bottom-1 right-1 bg-white/80 rounded p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <DraggableIcon className="h-4 w-4 text-gray-600" />
      </div>
      {/* First image indicator */}
      {index === 0 && (
        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          <FormattedMessage defaultMessage="Cover" />
        </div>
      )}
    </div>
  );
};

const EditImagesModal = ({
  bucketId,
  initialImages = [],
  open,
  handleClose,
}) => {
  const [images, setImages] = useState(removeNullValues(initialImages));

  const [{ fetching: loading }, editBucket] = useMutation(EDIT_IMAGES_MUTATION);

  const { handleSubmit } = useForm();
  const intl = useIntl();

  const [uploadingImage, setUploadingImage] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = images.findIndex((img) => img.small === active.id);
    const newIndex = images.findIndex((img) => img.small === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setImages(arrayMove(images, oldIndex, newIndex));
    }
  };

  const uploadFile = async (e) => {
    setUploadingImage(true);
    const files = e.target.files;
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", "dreams");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dreamswtf/image/upload",
      { method: "POST", body: data }
    );
    const file = await res.json();
    const small = file.eager[1].secure_url;
    const large = file.eager[0].secure_url;
    setImages([...images, { small, ...(large && { large }) }]);
    setUploadingImage(false);
  };

  const removeImage = (i) => {
    const removeByIndex = (array, index) => array.filter((_, i) => i !== index);
    setImages(removeByIndex(images, i));
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-md">
        <form
          onSubmit={handleSubmit(() => {
            images.forEach((image) => delete image.__typename); // apollo complains otherwise..

            editBucket({ images, bucketId })
              .then(() => {
                handleClose();
              })
              .catch((err) => alert(err.message));
          })}
        >
          <h1 className="text-xl font-semibold mb-4">
            <FormattedMessage defaultMessage="Edit images" />
          </h1>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((img) => img.small)}
              strategy={horizontalListSortingStrategy}
            >
              <Images>
                {images.map((image, i) => (
                  <SortableImage
                    key={image.small}
                    image={image}
                    index={i}
                    onRemove={removeImage}
                  />
                ))}
                {uploadingImage ? (
                  <label>
                    <FormattedMessage defaultMessage="uploading..." />
                  </label>
                ) : (
                  <label>
                    <FormattedMessage defaultMessage="Upload image" />
                    <input
                      type="file"
                      name="file"
                      placeholder={intl.formatMessage({
                        defaultMessage: "Upload image",
                      })}
                      onChange={uploadFile}
                    />
                  </label>
                )}
              </Images>
            </SortableContext>
          </DndContext>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600 font-medium">
              <FormattedMessage defaultMessage="Drag images to reorder. First image is the cover." />
            </div>
            <div className="flex">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="mr-2"
              >
                <FormattedMessage defaultMessage="Cancel" />
              </Button>
              <Button type="submit" loading={loading}>
                <FormattedMessage defaultMessage="Save" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditImagesModal;
