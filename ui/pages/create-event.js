import useForm from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import slugify from "../utils/slugify";
import { Box } from "@material-ui/core";

import Card from "../components/styled/Card";
import Form from "../components/styled/Form";

const CREATE_EVENT = gql`
  mutation CreateEvent(
    $adminEmail: String!
    $title: String!
    $slug: String!
    $currency: String!
    $registrationPolicy: RegistrationPolicy!
  ) {
    createEvent(
      adminEmail: $adminEmail
      title: $title
      slug: $slug
      currency: $currency
      registrationPolicy: $registrationPolicy
    ) {
      slug
      title
    }
  }
`;

export default ({ event }) => {
  if (event) return <div>redirect to root?</div>;
  const [createEvent, { data, error }] = useMutation(CREATE_EVENT);
  const { handleSubmit, register, errors } = useForm();
  const [slugValue, setSlugValue] = React.useState("");
  const [created, setCreated] = React.useState(false);

  const onSubmit = variables => {
    createEvent({ variables })
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
      <Card>
        <Box p={3}>
          Event was created.{" "}
          {process.env.IS_PROD
            ? "Check your email for a magic link to sign in."
            : "Check your console for a magic link to sign in (in development)."}
        </Box>
      </Card>
    );

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-2xl mb-2">Create event</h1>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Title <span>{errors.title && errors.title.message}</span>
            <input
              name="title"
              ref={register({
                required: "Required"
              })}
              onChange={e => setSlugValue(slugify(e.target.value))}
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
          <label>
            Currency <span>{errors.currency && errors.currency.message}</span>
            <select
              name="currency"
              ref={register({
                required: "Required"
              })}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="SEK">SEK</option>
              <option value="DKK">DKK</option>
            </select>
          </label>
          <label>
            Registration policy{" "}
            <span>
              {errors.registrationPolicy && errors.registrationPolicy.message}
            </span>
            <select name="registrationPolicy" ref={register}>
              <option value="OPEN">Open</option>
              <option value="REQUEST_TO_JOIN">Request to join</option>
              <option value="INVITE_ONLY">Invite only</option>
            </select>
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
      </Box>
    </Card>
  );
};
