import { useState, useRef } from "react";
import { CloseIcon, LoaderIcon } from "components/Icons";
import uploadImageFiles from "utils/uploadImageFiles";

const ImageUpload = ({
  label,
  cloudinaryPreset,
  initialImage,
  onImageUploaded,
  ...otherProps
}) => {
  const fileInputField = useRef(null);
  const [image, setImage] = useState(initialImage);
  const [uploadingImage, setUploadingImage] = useState(false);

  return (
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <div className="relative h-24 w-24">
        {image ? (
          <div className="h-24 w-24 relative">
            <img className="w-24 h-24 object-cover rounded" src={image} />
            <button
              type="button"
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
              onChange={(e) =>
                uploadImageFiles({
                  files: [e.target.files[0]],
                  setUploadingImages: [setUploadingImage],
                  setImages: [
                    (imgUrl) => {
                      setImage(imgUrl);
                      onImageUploaded(imgUrl);
                    },
                  ],
                  cloudinaryPreset,
                })
              }
              title=""
              value=""
              className="w-full absolute inset-0 opacity-0 hidden focus:outline-none -z-10"
              {...otherProps}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
