import { useState } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useMutation, gql } from "urql";
import Button from "../Button";
import TextField from "../TextField";
import ImageUpload from "components/ImageUpload";
import slugify from "utils/slugify";
import toast from "react-hot-toast";

const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!, $logo: String, $slug: String!) {
    createOrganization(name: $name, logo: $logo, slug: $slug) {
      id
      name
      logo
      slug
    }
  }
`;

const EDIT_ORGANIZATION = gql`
  mutation EditOrganization(
    $orgId: ID!
    $name: String!
    $logo: String
    $slug: String!
  ) {
    editOrganization(orgId: $orgId, name: $name, logo: $logo, slug: $slug) {
      id
      name
      logo
      slug
      customDomain
    }
  }
`;

const EditOrganization = ({ organization, currentUser }) => {
  const router = useRouter();
  const fromRealities = router.query.from === "realities";
  const [logoImage, setLogoImage] = useState(organization?.logo);
  const [{ fetching: loading }, createOrganization] = useMutation(
    CREATE_ORGANIZATION
  );
  const [{ fetching: editLoading }, editOrganization] = useMutation(
    EDIT_ORGANIZATION
  );

  const { handleSubmit, register, errors, reset } = useForm();

  const [slugValue, setSlugValue] = useState(organization?.slug ?? "");

  const isNew = !organization;

  const onSubmit = async (variables) => {
    try {
      if (isNew) {
        await createOrganization({ ...variables, logo: logoImage }).then(
          ({ error }) => {
            if (error) {
              toast.error(error.message.replace("[GraphQL]", ""));
            } else {
              toast.success("Organization created successfully");
              router.replace(`/${variables.slug}/settings`);
              router.push(`/${variables.slug}`);
            }
          }
        );
      } else {
        editOrganization({
          ...variables,
          logo: logoImage,
          orgId: organization.id,
        }).then(({ error }) => {
          if (error) {
            toast.error(error.message.replace("[GraphQL]", ""));
          } else {
            toast.success("Organization updated successfully");
            router.replace(`/${variables.slug}/settings`);
          }
        });
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
      <div className="bg-white rounded-lg shadow-xl p-6 flex-1 max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">
          {isNew ? `New Group` : "Edit Group"}
        </h1>
        <TextField
          name="name"
          label="Name"
          placeholder={`${currentUser.name}'s community`}
          inputRef={register({ required: "Required" })}
          defaultValue={organization?.name}
          error={errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          name="slug"
          label="URL"
          placeholder={slugify(`${currentUser.name}'s community`)}
          inputRef={register({ required: "Required" })}
          error={errors.slug}
          inputProps={{
            value: slugValue,
            onChange: (e) => {
              setSlugValue(e.target.value);
            },
            onBlur: (e) => setSlugValue(slugify(e.target.value)),
          }}
          helperText={errors.subdomain?.message}
          startAdornment={
            fromRealities ? (
              <span>{process.env.REALITIES_DEPLOY_URL}/</span>
            ) : (
              <span>{process.env.DEPLOY_URL}/</span>
            )
          }
        />

        {/* removing this for now since currently don't automatically update
            the redirect uris in keycloak
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
        */}

        <ImageUpload
          label="Logo"
          onImageUploaded={setLogoImage}
          cloudinaryPreset="organization_logos"
          initialImage={logoImage}
        />

        <Button fullWidth type="submit" loading={loading || editLoading}>
          {isNew ? "Continue" : "Save"}
        </Button>
      </div>
    </form>
  );
};

EditOrganization.propTypes = {
  currentUser: PropTypes.object.isRequired,
};

export default EditOrganization;
