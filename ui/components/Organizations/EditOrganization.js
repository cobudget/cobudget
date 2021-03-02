import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Button from "../Button";
import TextField from "../TextField";
import ImageUpload from "components/ImageUpload";
import { Tooltip } from "react-tippy";
import { QuestionMarkIcon } from "../Icons";
import slugify from "utils/slugify";

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

  const [slugValue, setSlugValue] = React.useState(
    organization?.subdomain ?? ""
  );

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
        const url = process.env.IS_PROD
          ? `https://${variables.subdomain}.${process.env.DEPLOY_URL}`
          : `http://${variables.subdomain}.localhost:3000`;
        window.location.assign(url);
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
    <div className="bg-white rounded-lg shadow p-6 flex-1 max-w-screen-sm">
      <h1 className="text-2xl font-semibold mb-2">
        {isNew ? "Create organization" : "Edit organization"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          name="name"
          label="Name"
          placeholder="Name"
          inputRef={register({ required: "Required" })}
          defaultValue={organization?.name}
          autoFocus
          className="mb-2"
          error={errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          name="subdomain"
          label="Subdomain"
          placeholder="subdomain"
          inputRef={register({ required: "Required" })}
          className="mb-2"
          defaultValue={organization?.subdomain}
          error={errors.subdomain}
          inputProps={{
            value: slugValue,
            onChange: (e) => setSlugValue(e.target.value),
            onBlur: (e) => setSlugValue(slugify(e.target.value)),
          }}
          helperText={errors.subdomain?.message}
          endAdornment={<span>.{process.env.DEPLOY_URL}</span>}
        />

        {organization?.customDomain && (
          <TextField
            name="customDomain"
            labelComponent={() => (
              <div className="items-center flex">
                Custom Domain (optional)
                <Tooltip
                  title={`<b>No need for http://</b><br/>
              For example to use 'dreams.YOURDOMAIN.com' you need to<br/>
              1. Open your domain account provider<br/>
              2. Set a new CNAME record with the name of 'dreams' and the value of ${process.env.DEPLOY_URL}`}
                  position="bottom"
                  size="small"
                >
                  <QuestionMarkIcon className="ml-1 w-5 h-5 text-gray-600 hover:text-black" />
                </Tooltip>
              </div>
            )}
            placeholder="orgdomain.com"
            inputRef={register}
            className="mb-2"
            defaultValue={organization?.customDomain}
            error={errors.customDomain}
            helperText={errors.customDomain?.message}
          />
        )}

        <ImageUpload
          text={"Upload Logo Image"}
          onImageUploaded={setLogoImage}
          cloudinaryPreset={"organization_logos"}
          initialImage={logoImage}
          className="my-2"
        />

        <Button type="submit" loading={loading || editLoading}>
          Save
        </Button>
      </form>
    </div>
  );
};
