import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Box } from "@material-ui/core";
import slugify from "../utils/slugify";
import currencies from "../utils/currencies";

import Card from "../components/styled/Card";
import Form from "../components/styled/Form";
import Router from "next/router";

const CREATE_EVENT = gql`
  mutation CreateEvent(
    $title: String!
    $slug: String!
    $currency: String!
    $registrationPolicy: RegistrationPolicy!
  ) {
    createEvent(
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

export default () => {
  const [createEvent, { data, error }] = useMutation(CREATE_EVENT);
  const { handleSubmit, register, errors } = useForm();
  const [slugValue, setSlugValue] = React.useState("");

  const onSubmit = (variables) => {
    createEvent({ variables })
      .then(({ data }) => {
        Router.push("/[event]", `/${data.createEvent.slug}`);
      })
      .catch((err) => {
        alert(err.message);
      });
  };

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
                required: "Required",
              })}
              onChange={(e) => setSlugValue(slugify(e.target.value))}
            />
          </label>
          <label>
            Slug <span>{errors.slug && errors.slug.message}</span>
            <input
              name="slug"
              ref={register({
                required: "Required",
              })}
              value={slugValue}
              onChange={(e) => setSlugValue(e.target.value)}
              onBlur={(e) => setSlugValue(slugify(e.target.value))}
            />
          </label>
          <label>
            Currency <span>{errors.currency && errors.currency.message}</span>
            <select
              name="currency"
              ref={register({
                required: "Required",
              })}
            >
              {currencies.map((currency) => (
                <option value={currency} key={currency}>
                  {currency}
                </option>
              ))}
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
          <button type="submit">Submit</button>
        </Form>
      </Box>
    </Card>
  );
};
