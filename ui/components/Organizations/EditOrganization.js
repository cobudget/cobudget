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
import { Tooltip } from "react-tippy";
import { QuestionMarkIcon } from "../Icons";
import Router from "next/router";

const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization(
    $name: String!
    $logo: String
    $subdomain: String!
  ) {
    createOrganization(name: $name, logo: $logo, subdomain: $subdomain) {
      name
      logo
      subdomain
    }
  }
`;

const EDIT_ORGANIZATION = gql`
  mutation EditOrganization(
    $organizationId: ID!
    $name: String!
    $logo: String
    $subdomain: String!
  ) {
    editOrganization(
      organizationId: $organizationId
      name: $name
      logo: $logo
      subdomain: $subdomain
      customDomain: $customDomain
    ) {
      name
      logo
      subdomain
      customDomain
    }
  }
`;

export default ({ organization, currentUser }) => {
  const [logoImage, setLogoImage] = useState(organization?.logo);
  const [createOrganization, { loading }] = useMutation(CREATE_ORGANIZATION);
  const [editOrganization, { editLoading }] = useMutation(EDIT_ORGANIZATION, {
    variables: { organizationId: organization?.id },
  });
  const { handleSubmit, register, errors, reset, getValues } = useForm();

  const isNew = !organization;

  const onSubmit = async (variables) => {
    try {
      variables = {
        ...variables,
        logo: logoImage,
      };
      if (isNew) {
        await createOrganization({ variables });
      } else {
        await editOrganization({ variables });
      }
      let message = isNew
        ? "Organization created successfully."
        : "Organization updated successfully.";

      if (isNew) {
        window.history.pushState(
          `http://${variables.subdomain}.localhost:3000`,
          ""
        );
      } else {
        alert(message);
      }
      // alert(message);
      reset();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-2xl mb-2">
          {isNew ? "Create organization" : "Edit organization"}
        </h1>
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
            text={"Upload Logo Image"}
            onImageUploaded={setLogoImage}
            cloudinaryPreset={"organization_logos"}
            initialImage={logoImage}
          />
          {organization?.customDomain && (
            <label>
              Custom Domain (Optional)
              <Tooltip
                style={{ display: "inline-block" }}
                title={`<b>No need for http://</b><br/>
              For example to use 'dreams.YOURDOMAIN.com' you need to<br/>
              1. Open your domain account provider<br/>
              2. Set a new CNAME record with the name of 'dreams' and the value of ${process.env.DEPLOY_URL}`}
                position="bottom"
                size="small"
              >
                <QuestionMarkIcon className="w-5 h-5" />
              </Tooltip>
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
          )}

          <Button type="submit" loading={loading || editLoading}>
            Save
          </Button>
        </Form>
      </Box>
    </Card>
  );
};
