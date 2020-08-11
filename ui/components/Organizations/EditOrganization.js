import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Box } from "@material-ui/core";
import Button from "../Button";
import TextField from "../TextField";
import Card from "../styled/Card";
import Form from "../styled/Form";
import ImageUpload from "components/ImageUpload";

const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization(
    $name: String!
    $logo: ImageInput
    $subdomain: String!
    $customDomain: String
    $adminEmail: String!
  ) {
    createOrganization(
      name: $name
      logo: $logo
      subdomain: $subdomain
      customDomain: $customDomain
      adminEmail: $adminEmail
    ) {
      name
      logo {
        small
        large
      }
      subdomain
      customDomain
    }
  }
`;

const EDIT_ORGANIZATION = gql`
  mutation EditOrganization(
    $organizationId: ID!
    $name: String!
    $logo: ImageInput
    $subdomain: String!
    $customDomain: String
  ) {
    editOrganization(
      organizationId: $organizationId
      name: $name
      logo: $logo
      subdomain: $subdomain
      customDomain: $customDomain
    ) {
      name
      logo {
        small
        large
      }
      subdomain
      customDomain
    }
  }
`;

export default ({organization, currentUser}) => {
  const [logoImage, setLogoImage] = useState(organization?.logo);
  const [createOrganization, { loading }] = useMutation(CREATE_ORGANIZATION);
  const [editOrganization, { editLoading }] = useMutation(EDIT_ORGANIZATION, {
    variables: { organizationId: organization?.id },
  });
  const { handleSubmit, register, errors, reset, getValues } = useForm();
  
  const isNew = !organization;

  const onSubmit = async(variables) => {
    try {
      variables = {
        ...variables,
        logo: logoImage,
      }
      if(isNew) {
        await createOrganization({ variables })
      }else {
        await editOrganization({ variables })
      };
      let message = isNew? "Organization created successfully." :  "Organization updated successfully.";
      {message += !isNew ? '': process.env.IS_PROD
        ? "\r\nMagic link sent! Check your email inbox!"
        : "\r\nFind the magic link in your development console!"}
      alert(message);
      reset();
    }
    catch(err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-2xl mb-2">{isNew? 'Create organization': 'Edit organization'}</h1>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Name
            <TextField
              name="name"
              placeholder="Name"
              inputRef={register({ required: "Required" })}
              defaultValue={organization?.name}
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
              defaultValue={organization?.subdomain}
              error={errors.subdomain}
              helperText={errors.subdomain?.message}
            />
          </label>
          <ImageUpload 
            text = {"Upload Logo Image"}
            onImageUploaded = {setLogoImage}
            cloudinaryPreset = {'organization_logos'}
            initialImage = {logoImage}
            />
          <label>
            Custom Domain (Optional) [no need for http://]
            <TextField
              name="customDomain"
              placeholder="orgdomain.com"
              inputRef={register}
              className="mb-2"
              defaultValue={organization?.customDomain}
              error={errors.customDomain}
              helperText={errors.customDomain?.message}
            />
          </label>
          {isNew && <><label>
            Your email
            <TextField
              name="adminEmail"
              placeholder="you@gmail.com"
              className="mb-2"
              defaultValue={currentUser?.email}
              error={errors.adminEmail}
              inputRef={register({
                validate: value => value === getValues("adminEmail2") || "Emails don't match",
                required: "Required",
                pattern: {
                  value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  message: "Invalid email",
                },
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
          </label></>}
          <Button type="submit" loading={loading || editLoading}>Save</Button>
        </Form>
      </Box>
    </Card>
  );
};
