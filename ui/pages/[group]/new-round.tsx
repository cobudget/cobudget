import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import Tooltip from "@tippyjs/react";
import Router, { useRouter } from "next/router";

import slugify from "utils/slugify";
import currencies from "utils/currencies";
import TextField from "components/TextField";
import { SelectField } from "components/SelectInput";
import Button from "components/Button";
import { QuestionMarkIcon } from "components/Icons";
import { FormattedMessage, useIntl } from "react-intl";
import { HIDDEN, PUBLIC } from "../../constants";
import PublicRoundWarning from "components/RoundSettings/PublicRoundWarning";

const CREATE_ROUND = gql`
  mutation CreateRound(
    $groupId: ID!
    $title: String!
    $slug: String!
    $currency: String!
    $registrationPolicy: RegistrationPolicy!
    $visibility: Visibility
  ) {
    createRound(
      groupId: $groupId
      title: $title
      slug: $slug
      currency: $currency
      registrationPolicy: $registrationPolicy
      visibility: $visibility
    ) {
      id
      slug
      title
      visibility
    }
  }
`;

export default function NewRoundPage({ currentGroup }) {
  const [, createRound] = useMutation(CREATE_ROUND);
  const { handleSubmit, register, formState: { errors }, setValue } = useForm();
  const [slugValue, setSlugValue] = useState("");
  const [isHidden, setIsHidden] = useState(currentGroup?.visibility === HIDDEN);
  const router = useRouter();
  const intl = useIntl();
  const onSubmit = (variables) => {
    createRound({ ...variables, groupId: currentGroup.id })
      .then(({ data }) => {
        console.log({ data });
        Router.push(
          "/[group]/[round]",
          `/${router.query.group}/${data.createRound.slug}`
        );
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  useEffect(() => {
    if (currentGroup) {
      setIsHidden(currentGroup?.visibility === HIDDEN);
    }
  }, [currentGroup]);

  const handleTitleChange = (e) => {
    const newSlug = slugify(e.target.value);
    setSlugValue(newSlug);
    setValue("slug", newSlug);
  };

  const handleSlugChange = (e) => {
    setSlugValue(e.target.value);
  };

  const handleSlugBlur = (e) => {
    const newSlug = slugify(e.target.value);
    setSlugValue(newSlug);
    setValue("slug", newSlug);
  };

  return (
    <div className="page">
      <div className="mx-auto bg-white rounded-lg shadow p-6 flex-1 max-w-screen-sm">
        <h1 className="text-2xl mb-2 font-semibold">
          <FormattedMessage defaultMessage="New round" />
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Title"
            placeholder="Title"
            inputRef={register("title", { required: "Required" }).ref}
            autoFocus
            className="mb-2"
            error={errors.title}
            helperText={errors.title?.message}
            inputProps={{
              ...register("title", { required: "Required" }),
              onChange: handleTitleChange,
            }}
          />
          <TextField
            labelComponent={() => (
              <div className="items-center flex">
                <FormattedMessage defaultMessage="Slug" />
                <Tooltip
                  content={intl.formatMessage({
                    defaultMessage: `The part that comes after the domain in the URL`,
                  })}
                  placement="bottom"
                  arrow={false}
                >
                  <QuestionMarkIcon className="ml-1 w-5 h-5 text-gray-600 hover:text-black" />
                </Tooltip>
              </div>
            )}
            placeholder={intl.formatMessage({ defaultMessage: "Slug" })}
            inputRef={register("slug", { required: "Required" }).ref}
            className="mb-2"
            error={errors.slug}
            helperText={errors.slug?.message}
            inputProps={{
              ...register("slug", { required: "Required" }),
              value: slugValue,
              onChange: handleSlugChange,
              onBlur: handleSlugBlur,
            }}
          />
          <SelectField
            label={intl.formatMessage({ defaultMessage: "Currency" })}
            className="mb-2"
            inputRef={register("currency", { required: "Required" }).ref}
            inputProps={register("currency", { required: "Required" })}
          >
            {currencies.map((currency) => (
              <option value={currency} key={currency}>
                {currency}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={intl.formatMessage({ defaultMessage: "Visibility" })}
            inputRef={register("visibility").ref}
            className="my-4"
            inputProps={{
              ...register("visibility"),
              onChange: (e) => {
                setIsHidden(e.target.value === HIDDEN);
              },
            }}
          >
            <option
              value="PUBLIC"
              selected={currentGroup?.visibility === PUBLIC}
            >
              {intl.formatMessage({ defaultMessage: "Public" })}
            </option>
            <option
              value="HIDDEN"
              selected={currentGroup?.visibility !== PUBLIC}
            >
              {intl.formatMessage({ defaultMessage: "Hidden" })}
            </option>
          </SelectField>

          <SelectField
            label="Registration policy"
            className="my-2"
            inputRef={register("registrationPolicy", { required: "Required" }).ref}
            inputProps={register("registrationPolicy", { required: "Required" })}
          >
            <option value="OPEN">
              {intl.formatMessage({ defaultMessage: "Open" })}
            </option>
            <option value="REQUEST_TO_JOIN">
              {intl.formatMessage({ defaultMessage: "Request to join" })}
            </option>
            <option value="INVITE_ONLY">
              {intl.formatMessage({ defaultMessage: "Invite only" })}
            </option>
          </SelectField>

          <PublicRoundWarning
            group={currentGroup}
            visibility={isHidden ? HIDDEN : PUBLIC}
          />

          <Button className="mt-2" type="submit">
            {intl.formatMessage({ defaultMessage: "Create" })}
          </Button>
        </form>
      </div>
    </div>
  );
}
