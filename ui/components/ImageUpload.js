import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@material-ui/core";

import Button from "components/Button";

export default ({
  text = "Set Image",
  cloudinaryPreset,
  initialImage,
  onImageUploaded,
}) => {
  const [image, setImage] = useState(initialImage);
  const { handleSubmit, register, errors } = useForm();
  const [open, setOpen] = useState(false);

  const [uploadingImage, setUploadingImage] = React.useState(false);

  const uploadFile = async (e) => {
    try {
      setUploadingImage(true);
      const files = e.target.files;
      const data = new FormData();
      data.append("file", files[0]);
      data.append("upload_preset", cloudinaryPreset);

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dreamswtf/image/upload",
        { method: "POST", body: data }
      );
      const file = await res.json();
      const newImage = file.secure_url;
      setImage(newImage);
      setUploadingImage(false);
      onImageUploaded(newImage);
      handleClose();
    } catch (error) {
      console.log(error);
      alert(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!open) {
    return (
      <div>
        <Button
          variant="secondary"
          onClick={() => {
            setOpen(true);
          }}
          className="mr-2"
        >
          {text}
        </Button>
        <img src={image} />
      </div>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex items-center justify-center p-2"
    >
      <div className="bg-white rounded-lg shadow p-4 focus:outline-none flex-1 max-w-xs">
        <form
          onSubmit={handleSubmit(() => {
            // delete image.__typename; // apollo complains otherwise..
            onImageUploaded(image);
          })}
        >
          {uploadingImage ? (
            <label>Uploading...</label>
          ) : (
            <>
              <label>
                Upload image
                <br />
                <input
                  type="file"
                  name="file"
                  placeholder="Upload image"
                  onChange={uploadFile}
                />
              </label>
            </>
          )}

          <div className="flex justify-between items-center">
            <div className=" text-sm text-gray-600 font-medium"></div>
            <div className="flex">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" loading={uploadingImage}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
