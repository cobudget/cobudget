import IconButton from "components/IconButton";
import { AddIcon, DeleteIcon, LoaderIcon } from "components/Icons";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import uploadImageFiles from "utils/uploadImageFiles";
import { FileUploader } from "react-drag-drop-files";
import {
  ALLOWED_EXPENSE_RECEIPT_TYPES,
  MAX_FILE_SIZE,
} from "../../../constants";
import toast from "react-hot-toast";

function UploadAttachment({
  name,
  cloudinaryPreset,
  inputRef,
  defaultLink = "",
}) {
  const intl = useIntl();
  const [link, setLink] = useState(defaultLink);
  const [uploading, setUploading] = useState(false);
  const [filename, setFilename] = useState("");

  const removeLink = () => setLink(undefined);

  const handleFilename = (file) => {
    const tokens = file.name.split(".");
    const format = tokens.slice(-1)[0].toLowerCase();
    const name = tokens.slice(0, tokens.length - 1).join(".");
    const nameLength = 12;
    setFilename(
      `${name.slice(0, nameLength)}${
        name.length > nameLength ? "..." : ""
      }.${format}`
    );
  };

  const handleUpload = (file) => {
    handleFilename(file);
    uploadImageFiles({
      files: [file],
      setUploadingImages: [setUploading],
      setImages: [
        (fileUrl) => {
          setLink(fileUrl);
        },
      ],
      cloudinaryPreset,
      resourceType: "auto",
    });
  };

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
            {filename || "File Selected"}
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
          maxSize={MAX_FILE_SIZE}
          onSizeError={() => {
            toast.error(
              intl.formatMessage({
                defaultMessage: "File size should be less than 8mb",
              })
            );
          }}
          types={ALLOWED_EXPENSE_RECEIPT_TYPES}
          onTypeError={() => {
            toast.error(
              intl.formatMessage({ defaultMessage: "Invalid file format" })
            );
          }}
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
