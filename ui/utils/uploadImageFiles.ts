const uploadImageFiles = async ({
  files,
  setUploadingImages,
  setImages,
  cloudinaryPreset,
}: {
  files: File[];
  setUploadingImages: Array<(boolean) => void>;
  setImages: Array<(string) => void>;
  cloudinaryPreset: string;
}) => {
  try {
    //TODO: make loop
    setUploadingImages[0](true);
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", cloudinaryPreset);

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dreamswtf/image/upload",
      { method: "POST", body: data }
    );
    const file = await res.json();
    const newImage = file.secure_url;
    setImages[0](newImage);
    setUploadingImages[0](false);
  } catch (error) {
    console.log(error);
    alert(error);
  } finally {
    setUploadingImages[0](false);
  }
};

export default uploadImageFiles;
