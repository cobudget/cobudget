import useForm from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router from "next/router";

const CREATE_DREAM = gql`
  mutation CreateDream(
    $eventSlug: String!
    $title: String!
    $description: String
  ) {
    createDream(
      eventSlug: $eventSlug
      title: $title
      description: $description
    ) {
      slug
      title
      description
    }
  }
`;
export default ({ eventSlug }) => {
  const [createDream, { data, error }] = useMutation(CREATE_DREAM);
  const { handleSubmit, register, errors } = useForm();

  const onSubmit = values => {
    createDream({ variables: { eventSlug, ...values } })
      .then(({ data }) => {
        Router.push(`/${eventSlug}/${data.createDream.slug}`);
      })
      .catch(err => {
        console.log({ err });
        alert(err.message);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>Title</label>
      <input
        name="title"
        ref={register({
          required: "Required"
        })}
      />
      {errors.title && errors.title.message}
      <label>Description</label>
      <input name="description" ref={register} />
      {errors.description && errors.description.message}

      <button type="submit">Submit</button>
    </form>
  );
};
