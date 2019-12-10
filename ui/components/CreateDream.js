import useForm from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router from "next/router";
import styled from "styled-components";
import urlSlug from "url-slug";
import Form from "./styled/Form";

const CREATE_DREAM = gql`
  mutation CreateDream(
    $eventId: ID!
    $title: String!
    $slug: String!
    $description: String
    $images: [ImageInput]
  ) {
    createDream(
      eventId: $eventId
      title: $title
      slug: $slug
      description: $description
      images: $images
    ) {
      slug
      title
      description
    }
  }
`;
export default ({ eventId }) => {
  const [createDream, { data, error }] = useMutation(CREATE_DREAM);
  const { handleSubmit, register, errors } = useForm();
  const [slugValue, setSlugValue] = React.useState("");
  const [image, setImage] = React.useState(null);

  const uploadFile = async e => {
    console.log("Uploading..");
    const files = e.target.files;
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", "dreams");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dreamswtf/image/upload",
      { method: "POST", body: data }
    );
    const file = await res.json();
    console.log({ file });
    setImage({ small: file.secure_url, large: file.eager[0].secure_url });
  };

  const onSubmit = values => {
    console.log({ values });
    createDream({ variables: { eventId, ...values, images: [image] } })
      .then(({ data }) => {
        Router.push(`/${data.createDream.slug}`);
      })
      .catch(err => {
        console.log({ err });
        alert(err.message);
      });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <label>Title</label>
      <input
        name="title"
        ref={register({
          required: "Required"
        })}
        onChange={e => setSlugValue(urlSlug(e.target.value))}
      />
      <label>Slug</label>
      <input
        name="slug"
        ref={register({
          required: "Required"
        })}
        value={slugValue}
        onChange={e => setSlugValue(e.target.value)}
        onBlur={e => setSlugValue(urlSlug(e.target.value))}
      />
      {errors.title && errors.title.message}
      <label>Description</label>
      <textarea name="description" ref={register} />
      {errors.description && errors.description.message}
      <label htmlFor="file">Images</label>
      <input
        type="file"
        name="file"
        placeholder="Upload image"
        required
        onChange={uploadFile}
      />
      {image && <img width="370" src={image.small} alt="Upload preview" />}
      {/* <label>Min funding goal</label>
      <input name="minGoal" ref={register} placeholder="0 EUR" />
      <label>Max funding goal</label>
      <input name="maxGoal" ref={register} placeholder="0 EUR" /> */}
      <label>Budget</label>
      <textarea name="budgetDescription" ref={register} />
      <button type="submit">Submit</button>
    </Form>
  );
};
