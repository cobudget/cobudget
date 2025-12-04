import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import Tooltip from "@tippyjs/react";
import Router from "next/router";
import Link from "next/link";

import slugify from "utils/slugify";
import currencies from "utils/currencies";
import TextField from "components/TextField";
import { SelectField } from "components/SelectInput";
import Button from "components/Button";
import { QuestionMarkIcon } from "components/Icons";
import toast from "react-hot-toast";
import { useIntl } from "react-intl";
import { PUBLIC } from "../constants";

const CREATE_ROUND = gql`
  mutation CreateRound(
    $groupId: ID
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
      slug
      title
      visibility
    }
  }
`;

export default function NewRoundPage({ currentGroup }) {
  const [, createRound] = useMutation(CREATE_ROUND);
  const { handleSubmit, register, formState: { errors } } = useForm();
  const [slugValue, setSlugValue] = useState("");

  const intl = useIntl();

  const onSubmit = (variables) => {
    createRound(variables).then(({ data, error }) => {
      if (error) {
        toast.error(
          error.message.includes("Unique constraint")
            ? "Slug is already taken"
            : error.message
        );
      } else {
        Router.push("/[group]/[round]", `/c/${data.createRound.slug}`);
      }
    });
  };

  return (
    <>
      {/* <PageHero>
        <h1 className="text-3xl font-semibold">New Round</h1>
      </PageHero> */}
      <div className="page">
        <div className="mx-auto max-w-md space-y-8 mt-10">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl mb-2 font-semibold">New Round</h1>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              data-testid="create-round-form"
            >
              <TextField
                name="title"
                label="Title"
                placeholder="Title"
                inputRef={register({ required: "Required" })}
                autoFocus
                className=""
                error={errors.title}
                helperText={errors.title?.message}
                testid={"round-title"}
                inputProps={{
                  onChange: (e) => setSlugValue(slugify(e.target.value)),
                }}
              />
              <TextField
                name="slug"
                labelComponent={() => (
                  <div className="items-center flex">
                    Slug
                    <Tooltip
                      content={`The part that comes after the domain in the URL`}
                      placement="bottom"
                      arrow={false}
                    >
                      <QuestionMarkIcon className="ml-1 w-5 h-5 text-gray-600 hover:text-black" />
                    </Tooltip>
                  </div>
                )}
                placeholder="Slug"
                inputRef={register({ required: "Required" })}
                className=""
                error={errors.slug}
                helperText={errors.slug?.message}
                inputProps={{
                  value: slugValue,
                  onChange: (e) => setSlugValue(e.target.value),
                  onBlur: (e) => setSlugValue(slugify(e.target.value)),
                }}
              />
              <SelectField
                name="currency"
                label="Currency"
                className=""
                inputRef={register({
                  required: "Required",
                })}
              >
                {currencies.map((currency) => (
                  <option value={currency} key={currency}>
                    {currency}
                  </option>
                ))}
              </SelectField>

              <SelectField
                name="visibility"
                label={intl.formatMessage({ defaultMessage: "Visibility" })}
                defaultValue={currentGroup?.visiblity || PUBLIC}
                inputRef={register}
                className="my-4"
              >
                <option value="PUBLIC">
                  {intl.formatMessage({ defaultMessage: "Public" })}
                </option>
                <option value="HIDDEN">
                  {intl.formatMessage({ defaultMessage: "Hidden" })}
                </option>
              </SelectField>

              <SelectField
                name="registrationPolicy"
                label="Registration policy"
                className=""
                inputRef={register({
                  required: "Required",
                })}
              >
                <option value="OPEN">Open</option>
                <option value="REQUEST_TO_JOIN">Request to join</option>
                <option value="INVITE_ONLY">Invite only</option>
              </SelectField>

              <Button
                className=""
                type="submit"
                fullWidth
                testid="create-round-button"
              >
                Create
              </Button>
            </form>
          </div>
          <Link href="/new-group">
            <a className="block mt-10 text-center rounded-lg border-2 border-green-400 px-6 py-4 font-semibold text-sm text-gray-600 bg-white cursor-pointer ">
              <span className="text-black">Create a Group</span>{" "}
              <span className="bg-green-400 rounded px-1 mr-0.5 text-white text-xs">
                PRO
              </span>{" "}
              if you would like to manage several Rounds with the same group of
              people.
            </a>
          </Link>
        </div>
      </div>
    </>
  );
}
