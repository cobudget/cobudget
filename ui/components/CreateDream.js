import useForm from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router from "next/router";

const CREATE_DREAM = gql`
  mutation CreateDream($eventId: ID!, $title: String!, $description: String) {
    createDream(eventId: $eventId, title: $title, description: $description) {
      slug
      title
      description
    }
  }
`;
export default ({ eventId }) => {
  const [createDream, { data, error }] = useMutation(CREATE_DREAM);
  const { handleSubmit, register, errors } = useForm();

  const onSubmit = values => {
    createDream({ variables: { eventId, ...values } })
      .then(({ data }) => {
        Router.push(`/${data.createDream.slug}`);
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
