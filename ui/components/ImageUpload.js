import styled from "styled-components";

const Images = styled.div`
  /* width: 100%; */
  margin: 10px 0;
  display: block;
  border-radius: 6px;
  background: #f7f8f9;
  padding: 14px;
  /* font-size: 20px; */
  border: 3px solid #f7f8f9;
  /* transition: border 0.2s ease-in-out, box-shadow 0.2s ease-in-out; */

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
    border: 3px dashed lightgrey;
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

export default ({ images, setImages }) => {
  const [uploadingImage, setUploadingImage] = React.useState(false);

  const uploadFile = async e => {
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

    setImages([
      ...images,
      { small: file.secure_url, large: file.eager[0].secure_url }
    ]);
    setUploadingImage(false);
  };

  const removeImage = i => {
    const removeByIndex = (array, index) => array.filter((_, i) => i !== index);
    setImages(removeByIndex(images, i));
  };

  return (
    <Images>
      {images.length > 0 &&
        images.map((image, i) => (
          <div className="image" key={image.small}>
            <a href={image.large} target="_blank">
              <img src={image.small} alt="Upload preview" />
            </a>
            <button onClick={() => removeImage(i)}>x</button>
          </div>
        ))}{" "}
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
  );
};
