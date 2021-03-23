import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@material-ui/core";
import { CloseIcon, LoaderIcon } from "components/Icons";
import Button from "components/Button";

const ImageUpload = ({
  label,
  cloudinaryPreset,
  initialImage,
  onImageUploaded,
  className,
  ...otherProps
}) => {
  const fileInputField = useRef(null);
  const [image, setImage] = useState(initialImage);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  return (
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <div className="relative h-24 w-24">
        {image ? (
          <div className="h-24 w-24 relative">
            <img className="w-24 h-24 object-cover rounded" src={image} />
            <button
              onClick={() => {
                setImage(null);
                onImageUploaded(null);
              }}
              className="absolute right-0 top-0 -mr-2 -mt-2 w-5 h-5 rounded-full bg-black text-white font-bold flex items-center justify-center"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => fileInputField.current.click()}
              disabled={uploadingImage}
              className="flex items-center justify-center h-24 w-24 border-dashed border-3 rounded bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-500 transition-colors ease-in-out duration-200 pointer-cursor z-10 relative focus:outline-none focus:border-green"
            >
              {uploadingImage ? (
                <LoaderIcon className="w-6 h-6 absolute animation-spin animation-linear animation-2s" />
              ) : (
                "Upload image"
              )}
            </button>
            <input
              type="file"
              ref={fileInputField}
              onChange={uploadFile}
              title=""
              value=""
              className="w-full absolute inset-0 opacity-0 focus:outline-none z-0 block"
              {...otherProps}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
