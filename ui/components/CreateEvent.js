import useForm from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router from "next/router";
import urlSlug from "url-slug";
import Form from "./styled/Form";

const CREATE_EVENT = gql`
  mutation CreateEvent(
    $adminEmail: String!
    $title: String!
    $slug: String!
    $currency: String!
  ) {
    createEvent(
      adminEmail: $adminEmail
      title: $title
      slug: $slug
      currency: $currency
    ) {
      slug
      title
    }
  }
`;

export default ({ hostInfo }) => {
  const [createEvent, { data, error }] = useMutation(CREATE_EVENT);
  const { handleSubmit, register, errors } = useForm();
  const [slugValue, setSlugValue] = React.useState("");
  const [created, setCreated] = React.useState(false);

  const onSubmit = values => {
    createEvent({
      variables: {
        ...values
      }
    })
      .then(({ data }) => {
        console.log("event created!");
        setCreated(true);
      })
      .catch(err => {
        console.log({ err });
        alert(err.message);
      });
  };

  if (created)
    return (
      <div>
        Event was created. Check your email for a magic link to sign in.
      </div>
    );

  return (
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
      <label>
        Currency <span>{errors.currency && errors.currency.message}</span>
        <input
          name="currency"
          ref={register({
            required: "Required"
          })}
        />
      </label>
      <label>
        Your email (admin)
        <span>{errors.adminEmail && errors.adminEmail.message}</span>
        <input
          name="adminEmail"
          ref={register({
            required: "Required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              message: "invalid email address"
            }
          })}
        />
      </label>
      <button type="submit">Submit</button>
    </Form>
  );
};
