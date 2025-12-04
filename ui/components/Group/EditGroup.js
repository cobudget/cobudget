import { useState } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useMutation, gql } from "urql";
import Button from "../Button";
import TextField from "../TextField";
import ImageUpload from "components/ImageUpload";
import Banner from "components/Banner";
import slugify from "utils/slugify";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";

const CREATE_GROUP = gql`
  mutation CreateGroup($name: String!, $logo: String, $slug: String!) {
    createGroup(name: $name, logo: $logo, slug: $slug) {
      id
      name
      logo
      slug
    }
  }
`;

const EDIT_GROUP = gql`
  mutation EditGroup(
    $groupId: ID!
    $name: String!
    $logo: String
    $slug: String
  ) {
    editGroup(groupId: $groupId, name: $name, logo: $logo, slug: $slug) {
      id
      name
      logo
      slug
    }
  }
`;

const EditGroup = ({ group, currentUser }) => {
  const router = useRouter();
  const [logoImage, setLogoImage] = useState(group?.logo);
  const [{ fetching: loading }, createGroup] = useMutation(CREATE_GROUP);
  const [{ fetching: editLoading }, editGroup] = useMutation(EDIT_GROUP);

  const { handleSubmit, register, formState: { errors }, reset } = useForm();
  const intl = useIntl();

  const [slugValue, setSlugValue] = useState(group?.slug ?? "");

  const isNew = !group;

  const onSubmit = async (variables) => {
    try {
      if (isNew) {
        await createGroup({ ...variables, logo: logoImage }).then(
          ({ error }) => {
            if (error) {
              toast.error(error.message.replace("[GraphQL]", ""));
            } else {
              toast.success(
                intl.formatMessage({
                  defaultMessage: "Group created successfully",
                })
              );
              router.replace(`/${variables.slug}/settings`);
              router.push(`/${variables.slug}`);
            }
          }
        );
      } else {
        editGroup({
          ...variables,
          logo: logoImage,
          groupId: group.id,
        }).then(({ error }) => {
          if (error) {
            toast.error(error.message.replace("[GraphQL]", ""));
          } else {
            toast.success(
              intl.formatMessage({
                defaultMessage: "Group updated successfully",
              })
            );
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
          {isNew ? (
            <FormattedMessage defaultMessage="New Group" />
          ) : (
            <FormattedMessage defaultMessage="Edit Group" />
          )}
        </h1>
        <TextField
          label="Name"
          placeholder={intl.formatMessage(
            { defaultMessage: "{name}'s community" },
            { name: currentUser.name }
          )}
          inputRef={register("name", { required: "Required" }).ref}
          inputProps={register("name", { required: "Required" })}
          defaultValue={group?.name}
          error={errors.name}
          helperText={errors.name?.message}
        />
        {process.env.SINGLE_GROUP_MODE !== "true" && (
          <TextField
            label={intl.formatMessage({ defaultMessage: "URL" })}
            placeholder={slugify(
              intl.formatMessage(
                { defaultMessage: "{name}'s community" },
                { name: currentUser.name }
              )
            )}
            inputRef={register("slug", { required: "Required" }).ref}
            error={errors.slug}
            inputProps={{
              ...register("slug", { required: "Required" }),
              value: slugValue,
              onChange: (e) => {
                setSlugValue(e.target.value);
              },
              onBlur: (e) => setSlugValue(slugify(e.target.value)),
            }}
            helperText={errors.slug?.message}
            startAdornment={<span>{process.env.DEPLOY_URL}/</span>}
          />
        )}

        {/* removing this for now since currently don't automatically update
            the redirect uris in keycloak
        {group?.customDomain && (
          <TextField
            name="customDomain"
            labelComponent={() => (
              <div className="items-center flex">
                Custom Domain (optional)
                <Tooltip
                  title={`<b>No need for http://</b><br/>
              For example to use 'buckets.YOURDOMAIN.com' you need to<br/>
              1. Open your domain account provider<br/>
              2. Set a new CNAME record with the name of 'buckets' and the value of ${process.env.DEPLOY_URL}`}
                  position="bottom"
                  size="small"
                >
                  <QuestionMarkIcon className="ml-1 w-5 h-5 text-gray-600 hover:text-black" />
                </Tooltip>
              </div>
            )}
            placeholder="groupdomain.com"
            inputRef={register}
            className="mb-4"
            defaultValue={group?.customDomain}
            error={errors.customDomain}
            helperText={errors.customDomain?.message}
          />
        )}
        */}

        <ImageUpload
          label={intl.formatMessage({ defaultMessage: "Logo" })}
          onImageUploaded={setLogoImage}
          cloudinaryPreset="organization_logos"
          initialImage={logoImage}
        />

        <Button fullWidth type="submit" loading={loading || editLoading}>
          {isNew ? (
            <FormattedMessage defaultMessage="Continue" />
          ) : (
            <FormattedMessage defaultMessage="Save" />
          )}
        </Button>

        {group?.experimentalFeatures && (
          <div className="text-gray-600">
            <Banner
              className={"mb-4"}
              variant="warning"
              title={intl.formatMessage(
                {
                  defaultMessage:
                    "Experimental features are enabled for this group. This might cause things to break more often for you. Contact {platformName} if you wish to disable this.",
                },
                {
                  platformName: process.env.PLATFORM_NAME,
                }
              )}
            />
          </div>
        )}
      </div>
    </form>
  );
};

EditGroup.propTypes = {
  currentUser: PropTypes.object.isRequired,
};

export default EditGroup;
