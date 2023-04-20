const uploadImageFiles = ({
  files,
  setUploadingImages,
  setImages,
  cloudinaryPreset,
  resourceType,
}: {
  files: File[];
  setUploadingImages: Array<(boolean) => void>;
  setImages?: Array<(string) => void>;
  cloudinaryPreset: string;
  resourceType?: string;
}): Array<Promise<string>> => {
  return files.map(async (file, i) => {
    try {
      setUploadingImages[i](true);
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", cloudinaryPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dreamswtf/${
          resourceType || "image"
        }/upload`,
        { method: "POST", body: data }
      );
      const fileJson = await res.json();
      const newImage = fileJson.secure_url;
      setImages?.[i](newImage);
      setUploadingImages[i](false);

      return newImage;
    } catch (error) {
      console.log(error);
      alert(error);
    } finally {
      setUploadingImages[i](false);
    }
  });
};

export default uploadImageFiles;
