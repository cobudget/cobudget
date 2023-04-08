import IconButton from "components/IconButton";
import { AddIcon, DeleteIcon, LoaderIcon } from "components/Icons";
import React, { useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import uploadImageFiles from "utils/uploadImageFiles";
import { FileUploader } from "react-drag-drop-files";

function UploadAttachment({ name, cloudinaryPreset, inputRef }) {
  const fileInputField = useRef(null);
  const [link, setLink] = useState();
  const [uploading, setUploading] = useState(false);

  const removeLink = () => setLink(undefined);

  const handleUpload = (file) =>
    uploadImageFiles({
      files: [file],
      setUploadingImages: [setUploading],
      setImages: [
        (fileUrl) => {
          setLink(fileUrl);
        },
      ],
      cloudinaryPreset,
    });

  if (link) {
    return (
      <div className="mr-2 sm:my-0 flex-1">
        <div className="flex min-w-0 my-1 whitespace-nowrap font-medium flex px-2 py-2 rounded-md bg-gray-100 w-full border-3 border-transparent">
          <span>
            <IconButton onClick={removeLink}>
              <DeleteIcon width={18} height={18} />
            </IconButton>
          </span>

          <span className="flex mt-1.5 ml-1.5">
            File Selected
            <input type="hidden" name={name} value={link} ref={inputRef} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mr-2 sm:my-0 block">
      <div className="flex min-w-0 my-1">
        <FileUploader
          disables={uploading}
          handleChange={handleUpload}
          hoverTitle="&nbsp;"
        >
          <div className="font-medium flex px-8 py-3 rounded-md bg-gray-100 w-full border-3 border-transparent">
            <span className="mx-1 my-0.5">
              {uploading ? (
                <LoaderIcon
                  className="animate-spin"
                  fill="#000"
                  width={20}
                  height={20}
                />
              ) : (
                <AddIcon width={20} height={20} />
              )}
            </span>
            <FormattedMessage defaultMessage="Upload Attachment" />
          </div>
        </FileUploader>
        <input type="hidden" name={name} value="" ref={inputRef} />
      </div>
    </div>
  );
}

export default UploadAttachment;
