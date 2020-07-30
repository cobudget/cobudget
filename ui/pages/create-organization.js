import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Box } from "@material-ui/core";
import Button from "../components/Button";
import TextField from "../components/TextField";
import Card from "../components/styled/Card";
import Form from "../components/styled/Form";
import Router from "next/router";

const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization(
    $name: String!
    $subdomain: String!
    $customDomain: String
    $adminEmail: String!
  ) {
    createOrganization(
      name: $name
      subdomain: $subdomain
      customDomain: $customDomain
      adminEmail: $adminEmail
    ) {
      name
      subdomain
      customDomain
    }
  }
`;

export default ({currentUser}) => {
  const [createOrganization, { data, error, loading }] = useMutation(CREATE_ORGANIZATION);
  const { handleSubmit, register, errors, reset, getValues } = useForm();

  const onSubmit = (variables) => {
    createOrganization({ variables })
      .then(({ data }) => {
        let message = "Organization created successfully.";
        {message += process.env.IS_PROD
          ? "Magic link sent! Check your email inbox!"
          : "Find the magic link in your development console!"}
        alert(message);
        reset();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-2xl mb-2">Create organization</h1>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Name
            <TextField
              name="name"
              placeholder="Name"
              inputRef={register({ required: "Required" })}
              autoFocus
              className="mb-2"
              error={errors.name}
              helperText={errors.name?.message}
            />
          </label>
          <label>
            Subdomain
            <TextField
              name="subdomain"
              placeholder="dreamy-org"
              inputRef={register({ required: "Required" })}
              className="mb-2"
              error={errors.subdomain}
              helperText={errors.subdomain?.message}
            />
          </label>
          <label>
            Custom Domain (Optional) [no need for http://]
            <TextField
              name="customDomain"
              placeholder="orgdomain.com"
              inputRef={register}
              className="mb-2"
              error={errors.customDomain}
              helperText={errors.customDomain?.message}
            />
          </label>
          <label>
            Your email
            <TextField
              name="adminEmail"
              placeholder="you@gmail.com"
              className="mb-2"
              defaultValue={currentUser?.email}
              error={errors.adminEmail}
              inputRef={register({
                validate: value => value === getValues("adminEmail2") || "Emails don't match"
              })}
              helperText={errors.adminEmail?.message}
            />
          </label>
          <label>
            Confirm email
            <TextField
              name="adminEmail2"
              placeholder="you@gmail.com"
              className="mb-2"
              defaultValue={currentUser?.email}
              error={errors.adminEmail2}
              inputRef={register({
                validate: value => value === getValues("adminEmail") || "Emails don't match"
              })}
              helperText={errors.adminEmail2?.message}
            />
          </label>
          <Button type="submit" loading={loading}>Save</Button>
        </Form>
      </Box>
    </Card>
  );
};
