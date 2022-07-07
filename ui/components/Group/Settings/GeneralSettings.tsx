import { useState } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useMutation, gql } from "urql";
import Button from "../../Button";
import TextField from "../../TextField";
import ImageUpload from "components/ImageUpload";
import Banner from "components/Banner";
import slugify from "utils/slugify";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";

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
  const [{ fetching }, editGroup] = useMutation(EDIT_GROUP);

  const { handleSubmit, register, errors, reset } = useForm();
  const intl = useIntl();

  const [slugValue, setSlugValue] = useState(group?.slug ?? "");

  const onSubmit = async (variables) => {
    try {
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
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className=" px-6 flex-1 space-y-4">
        <h1 className="text-2xl font-semibold">
          <FormattedMessage defaultMessage="General" />
        </h1>
        <TextField
          name="name"
          label="Name"
          placeholder={intl.formatMessage(
            { defaultMessage: "{name}'s community" },
            { name: currentUser.name }
          )}
          inputRef={register({ required: "Required" })}
          defaultValue={group?.name}
          error={errors.name}
          helperText={errors.name?.message}
        />
        {process.env.SINGLE_GROUP_MODE !== "true" && (
          <TextField
            name="slug"
            label={intl.formatMessage({ defaultMessage: "URL" })}
            placeholder={slugify(
              intl.formatMessage(
                { defaultMessage: "{name}'s community" },
                { name: currentUser.name }
              )
            )}
            inputRef={register({ required: "Required" })}
            error={errors.slug}
            inputProps={{
              value: slugValue,
              onChange: (e) => {
                setSlugValue(e.target.value);
              },
              onBlur: (e) => setSlugValue(slugify(e.target.value)),
            }}
            helperText={errors.slug?.message}
            startAdornment={process.env.DEPLOY_URL + "/"}
          />
        )}

        <ImageUpload
          label={intl.formatMessage({ defaultMessage: "Logo" })}
          onImageUploaded={setLogoImage}
          cloudinaryPreset="organization_logos"
          initialImage={logoImage}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={fetching}>
            <FormattedMessage defaultMessage="Save" />
          </Button>
        </div>

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
