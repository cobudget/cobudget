import useForm from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router from "next/router";
import urlSlug from "url-slug";

import Form from "../components/styled/Form";
import Card from "../components/styled/Card";
import ImageUpload from "../components/ImageUpload";

const CREATE_DREAM = gql`
  mutation CreateDream(
    $eventId: ID!
    $title: String!
    $slug: String!
    $description: String
    $images: [ImageInput]
    $minGoal: Int
    $maxGoal: Int
  ) {
    createDream(
      eventId: $eventId
      title: $title
      slug: $slug
      description: $description
      images: $images
      minGoal: $minGoal
      maxGoal: $maxGoal
    ) {
      slug
      title
      description
    }
  }
`;

export default ({ event }) => {
  const [createDream, { data, error }] = useMutation(CREATE_DREAM);
  const { handleSubmit, register, errors } = useForm();
  const [slugValue, setSlugValue] = React.useState("");
  const [images, setImages] = React.useState([]);

  const onSubmit = values => {
    createDream({
      variables: {
        eventId: event.id,
        ...values,
        minGoal: values.minGoal === "" ? null : Number(values.minGoal),
        maxGoal: values.maxGoal === "" ? null : Number(values.maxGoal),
        images
      }
    })
      .then(({ data }) => {
        Router.push(`/${data.createDream.slug}`);
      })
      .catch(err => {
        console.log({ err });
        alert(err.message);
      });
  };

  return (
    <Card>
      <h1>Create dream</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <label>
          Title <span>{errors.title && errors.title.message}</span>
          <input
            name="title"
            ref={register({
              required: "Required"
            })}
            onChange={e => setSlugValue(urlSlug(e.target.value))}
          />
        </label>
        <label>
          Slug <span>{errors.slug && errors.slug.message}</span>
          <input
            name="slug"
            ref={register({
              required: "Required"
            })}
            value={slugValue}
            onChange={e => setSlugValue(e.target.value)}
            onBlur={e => setSlugValue(urlSlug(e.target.value))}
          />
        </label>

        <label>Images</label>
        <ImageUpload images={images} setImages={setImages} />

        <label>
          Description
          <textarea name="description" ref={register} rows={10} />
        </label>

        <div className="two-cols">
          <label>
            Min funding goal
            <input
              name="minGoal"
              type="number"
              ref={register({ min: 0 })}
              placeholder={`0 ${event.currency}`}
            />
          </label>
          <label>
            Max funding goal
            <input
              name="maxGoal"
              type="number"
              ref={register({ min: 0 })}
              placeholder={`0 ${event.currency}`}
            />
          </label>
        </div>
        <button type="submit">Submit</button>
      </Form>
    </Card>
  );
};
