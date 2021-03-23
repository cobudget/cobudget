import { useState } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
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

const EditOrganization = ({ organization, currentUser }) => {
  const router = useRouter();
  const fromRealities = router.query.from === "realities";
  const [logoImage, setLogoImage] = useState(organization?.logo);
  const [createOrganization, { loading }] = useMutation(CREATE_ORGANIZATION);
  const [editOrganization, { editLoading }] = useMutation(EDIT_ORGANIZATION, {
    variables: { organizationId: organization?.id },
  });
  const { handleSubmit, register, errors, reset } = useForm();

  const [slugValue, setSlugValue] = useState(organization?.subdomain ?? "");

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
        const dreamsUrl = process.env.IS_PROD
          ? `https://${variables.subdomain}.${process.env.DEPLOY_URL}`
          : `http://${variables.subdomain}.localhost:3000`;

        const realitiesUrl = `http${process.env.IS_PROD ? "s" : ""}://${
          process.env.REALITIES_DEPLOY_URL
        }/${variables.subdomain}`;

        const url = fromRealities ? realitiesUrl : dreamsUrl;

        window.location.assign(url);
      } else {
        alert(message);
      }
      reset();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 flex-1 max-w-md">
      <h1 className="text-2xl font-semibold mb-4">
        {isNew ? `👋 Welcome, ${currentUser.firstName}` : "Edit organization"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          name="name"
          label="Name your community"
          placeholder={`${currentUser.firstName}'s community`}
          inputRef={register({ required: "Required" })}
          defaultValue={organization?.name}
          autoFocus
          className="mb-4"
          error={errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          name="subdomain"
          label={fromRealities ? "Link" : "Subdomain"}
          placeholder={slugify(`${currentUser.firstName}'s community`)}
          inputRef={register({ required: "Required" })}
          className="mb-4"
          error={errors.subdomain}
          inputProps={{
            value: slugValue,
            onChange: (e) => setSlugValue(e.target.value),
            onBlur: (e) => setSlugValue(slugify(e.target.value)),
          }}
          helperText={errors.subdomain?.message}
          startAdornment={
            fromRealities && <span>{process.env.REALITIES_DEPLOY_URL}/</span>
          }
          endAdornment={
            !fromRealities && <span>.{process.env.DEPLOY_URL}</span>
          }
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
            className="mb-4"
            defaultValue={organization?.customDomain}
            error={errors.customDomain}
            helperText={errors.customDomain?.message}
          />
        )}

        <ImageUpload
          label="Logo"
          onImageUploaded={setLogoImage}
          cloudinaryPreset="organization_logos"
          initialImage={logoImage}
          className="my-2"
        />

        <Button fullWidth type="submit" loading={loading || editLoading}>
          {isNew ? "Continue" : "Save"}
        </Button>
      </form>
    </div>
  );
};

EditOrganization.propTypes = {
  currentUser: PropTypes.object.isRequired,
};

export default EditOrganization;
