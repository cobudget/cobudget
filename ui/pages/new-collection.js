import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import { Tooltip } from "react-tippy";
import Router from "next/router";

import slugify from "utils/slugify";
import currencies from "utils/currencies";
import TextField from "components/TextField";
import { SelectField } from "components/SelectInput";
import Button from "components/Button";
import { QuestionMarkIcon } from "components/Icons";
import toast from "react-hot-toast";

const CREATE_COLLECTION = gql`
  mutation CreateCollection(
    $orgId: ID
    $title: String!
    $slug: String!
    $currency: String!
    $registrationPolicy: RegistrationPolicy!
  ) {
    createCollection(
      orgId: $orgId
      title: $title
      slug: $slug
      currency: $currency
      registrationPolicy: $registrationPolicy
    ) {
      slug
      title
    }
  }
`;

export default function NewCollectionPage({ currentOrg }) {
  const [, createCollection] = useMutation(CREATE_COLLECTION);
  const { handleSubmit, register, errors } = useForm();
  const [slugValue, setSlugValue] = useState("");

  const onSubmit = (variables) => {
    createCollection(variables).then(({ data, error }) => {
      if (error) {
        toast.error(
          error.message.includes("Unique constraint")
            ? "Slug is already taken"
            : error.message
        );
      } else {
        Router.push("/[org]/[collection]", `/c/${data.createCollection.slug}`);
      }
    });
  };

  return (
    <div className="page">
      <div className="mx-auto bg-white rounded-lg shadow p-6 flex-1 max-w-screen-sm">
        <h1 className="text-2xl mb-2 font-semibold">Create group</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            name="title"
            label="Title"
            placeholder="Title"
            inputRef={register({ required: "Required" })}
            autoFocus
            className="mb-2"
            error={errors.title}
            helperText={errors.title?.message}
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
                  title={`The part that comes after the domain in the URL`}
                  position="bottom"
                  size="small"
                >
                  <QuestionMarkIcon className="ml-1 w-5 h-5 text-gray-600 hover:text-black" />
                </Tooltip>
              </div>
            )}
            placeholder="Slug"
            inputRef={register({ required: "Required" })}
            className="mb-2"
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
            className="mb-2"
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
            name="registrationPolicy"
            label="Registration policy"
            className="my-2"
            inputRef={register({
              required: "Required",
            })}
          >
            <option value="OPEN">Open</option>
            <option value="REQUEST_TO_JOIN">Request to join</option>
            <option value="INVITE_ONLY">Invite only</option>
          </SelectField>

          <Button className="mt-2" type="submit">
            Create
          </Button>
        </form>
      </div>
    </div>
  );
}
