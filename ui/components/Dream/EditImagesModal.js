import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { styled as muiStyled } from "@material-ui/core/styles";

import { FormControl, InputLabel, Modal } from "@material-ui/core";

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
  mutation EDIT_IMAGES($dreamId: ID!, $images: [ImageInput]) {
    editDream(dreamId: $dreamId, images: $images) {
      id
      images {
        small
        large
      }
    }
  }
`;

const StyledLabel = muiStyled(InputLabel)({
  background: "white",
  padding: "0 10px",
  marginLeft: -5,
});

// prevent saving null values to images.
const removeNullValues = (images) =>
  images.map(({ small, large }) => ({
    ...(small && { small }),
    ...(large && { large }),
  }));

const EditImagesModal = ({
  dreamId,
  initialImages = [],
  open,
  handleClose,
}) => {
  const [images, setImages] = useState(removeNullValues(initialImages));

  const [editDream, { loading }] = useMutation(EDIT_IMAGES_MUTATION, {
    variables: { dreamId },
  });

  const { handleSubmit, register, errors } = useForm();

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

            editDream({ variables: { images } })
              .then((data) => {
                handleClose();
              })
              .catch((err) => alert(err.message));
          })}
        >
          <h1 className="text-xl font-semibold mb-4">Edit images</h1>
          <Images>
            {images.length > 0 &&
              images.map((image, i) => (
                <div className="image" key={image.small}>
                  <a href={image.large} target="_blank">
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
              <label>uploading...</label>
            ) : (
              <>
                <label>
                  Upload image
                  <input
                    type="file"
                    name="file"
                    placeholder="Upload image"
                    onChange={uploadFile}
                  />
                </label>
              </>
            )}
          </Images>

          <div className="flex justify-between items-center">
            <div className=" text-sm text-gray-600 font-medium">
              The first image will also be used as cover photo
            </div>
            <div className="flex">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditImagesModal;
