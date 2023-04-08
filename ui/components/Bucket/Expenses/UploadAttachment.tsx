import IconButton from "components/IconButton";
import { AddIcon, DeleteIcon } from "components/Icons";
import React, { useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import uploadImageFiles from "utils/uploadImageFiles";

function UploadAttachment({ name, cloudinaryPreset, inputRef }) {
  const fileInputField = useRef(null);
  const [link, setLink] = useState();

  const removeLink = () => setLink(undefined);

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
        <button
          onClick={() => fileInputField.current.click()}
          className="font-medium flex px-8 py-3 rounded-md  bg-gray-100 w-full border-3 border-transparent"
        >
          <span className="mx-1 my-0.5">
            <AddIcon width={20} height={20} />
          </span>
          <FormattedMessage defaultMessage="Upload Attachment" />
        </button>
        <input
          type="file"
          ref={fileInputField}
          onChange={(e) =>
            uploadImageFiles({
              files: [e.target.files[0]],
              setUploadingImages: [() => ""],
              setImages: [
                (fileUrl) => {
                  setLink(fileUrl);
                },
              ],
              cloudinaryPreset,
            })
          }
          title=""
          value=""
          className="w-full absolute inset-0 opacity-0 hidden focus:outline-none -z-10"
        />
        <input type="hidden" name={name} value="" ref={inputRef} />
      </div>
    </div>
  );
}

export default UploadAttachment;
