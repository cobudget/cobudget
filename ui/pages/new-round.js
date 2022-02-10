import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import { Tooltip } from "react-tippy";
import Router from "next/router";
import Link from "next/link";

import slugify from "utils/slugify";
import currencies from "utils/currencies";
import TextField from "components/TextField";
import { SelectField } from "components/SelectInput";
import Button from "components/Button";
import { QuestionMarkIcon } from "components/Icons";
import toast from "react-hot-toast";
import PageHero from "../components/PageHero";

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
    <>
      {/* <PageHero>
        <h1 className="text-3xl font-semibold">New Round</h1>
      </PageHero> */}
      <div className="page">
        <div className="mx-auto max-w-md space-y-8 mt-10">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl mb-2 font-semibold">New Round</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <TextField
                name="title"
                label="Title"
                placeholder="Title"
                inputRef={register({ required: "Required" })}
                autoFocus
                className=""
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

              <Button className="" type="submit" fullWidth>
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
