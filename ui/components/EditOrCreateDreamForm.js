import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import Router from "next/router";

import ImageUpload from "./ImageUpload";
import Form from "./styled/Form";
import slugify from "../utils/slugify";

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
      id
      slug
      description
      title
      minGoal
      maxGoal
      images {
        small
        large
      }
    }
  }
`;

const EDIT_DREAM = gql`
  mutation EDIT_DREAM(
    $dreamId: ID!
    $title: String!
    $slug: String!
    $description: String
    $images: [ImageInput]
    $minGoal: Int
    $maxGoal: Int
  ) {
    editDream(
      dreamId: $dreamId
      title: $title
      slug: $slug
      description: $description
      images: $images
      minGoal: $minGoal
      maxGoal: $maxGoal
    ) {
      id
      slug
      description
      title
      minGoal
      maxGoal
      images {
        small
        large
      }
    }
  }
`;

export default ({ dream = {}, event, editing }) => {
  const [editDream] = useMutation(EDIT_DREAM);
  const [createDream] = useMutation(CREATE_DREAM);
  const { handleSubmit, register, errors } = useForm();

  const {
    title = "",
    slug = "",
    description = "",
    minGoal = "",
    maxGoal = ""
  } = dream;

  const [slugValue, setSlugValue] = React.useState(slug);
  const [images, setImages] = React.useState(dream.images ? dream.images : []);

  const onSubmitCreate = values => {
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
        Router.push("/[dream]", `/${data.createDream.slug}`);
      })
      .catch(err => {
        console.log({ err });
        alert(err.message);
      });
  };

  const onSubmitEdit = values => {
    images.forEach(image => delete image.__typename); // apollo complains otherwise..
    editDream({
      variables: {
        dreamId: dream.id,
        ...values,
        minGoal: values.minGoal === "" ? null : Number(values.minGoal),
        maxGoal: values.maxGoal === "" ? null : Number(values.maxGoal),
        images
      }
    })
      .then(({ data }) => {
        Router.push("/[dream]", `/${data.editDream.slug}`);
      })
      .catch(err => {
        console.log({ err });
        alert(err.message);
      });
  };

  return (
    <Form onSubmit={handleSubmit(editing ? onSubmitEdit : onSubmitCreate)}>
      <label>
        Title <span>{errors.title && errors.title.message}</span>
        <input
          name="title"
          ref={register({
            required: "Required"
          })}
          onChange={e => {
            if (!editing) setSlugValue(slugify(e.target.value));
          }}
          defaultValue={title}
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
          onBlur={e => setSlugValue(slugify(e.target.value))}
        />
      </label>

      <label>Images</label>
      <ImageUpload images={images} setImages={setImages} />

      <label>
        Description
        <textarea
          name="description"
          ref={register}
          rows={10}
          defaultValue={description}
        />
      </label>

      <div className="two-cols">
        <label>
          Min funding goal
          <input
            name="minGoal"
            type="number"
            ref={register({ min: 0 })}
            placeholder={`0 ${event.currency}`}
            defaultValue={minGoal}
          />
        </label>
        <label>
          Max funding goal
          <input
            name="maxGoal"
            type="number"
            ref={register({ min: 0 })}
            placeholder={`0 ${event.currency}`}
            defaultValue={maxGoal}
          />
        </label>
      </div>
      <button type="submit">Submit</button>
    </Form>
  );
};
