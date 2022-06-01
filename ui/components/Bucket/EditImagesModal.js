import { useState } from "react";
import { useMutation, gql } from "urql";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { FormattedMessage, useIntl } from "react-intl";

import { Modal } from "@material-ui/core";

import Button from "components/Button";

const Images = styled.div`
  display: flex;
  .image {
    position: relative;
    margin-right: 15px;
    button {
      position: absolute;
      top: -8px;
      right: -8px;
    }
  }
  img {
    height: 140px;
    width: 140px;
    object-fit: cover;
    object-position: center;
    border-radius: 6px;
  }
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
          <Images>
            {images.length > 0 &&
              images.map((image, i) => (
                <div className="image" key={image.small}>
                  <a href={image.large} target="_blank" rel="noreferrer">
                    <img src={image.small} alt="Preview" />
                  </a>
                  <button
                    className="bg-white border rounded-full p-1"
                    onClick={() => removeImage(i)}
                  >
                    x
                  </button>
                </div>
              ))}
            {uploadingImage ? (
              <label>
                <FormattedMessage defaultMessage="uploading..." />
              </label>
            ) : (
              <>
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
              </>
            )}
          </Images>

          <div className="flex justify-between items-center">
            <div className=" text-sm text-gray-600 font-medium">
              <FormattedMessage defaultMessage="The first image will be used as cover" />
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
