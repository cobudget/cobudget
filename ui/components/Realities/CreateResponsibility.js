import React from "react";
import PropTypes from "prop-types";
import { gql, useMutation } from "@apollo/client";
import * as yup from "yup";
import { useRouter } from "next/router";
import { Formik } from "formik";
import { GET_RESPONSIBILITIES, CACHE_QUERY } from "lib/realities/queries";
import getRealitiesApollo from "lib/realities/getRealitiesApollo";
import ListForm from "./ListForm";
import { FormattedMessage, useIntl } from "react-intl";

const CREATE_RESPONSIBILITY = gql`
  mutation CreateResponsibility_createResponsibilityMutation(
    $title: String!
    $needId: ID!
  ) {
    createResponsibility(title: $title, needId: $needId) {
      nodeId
      title
      realizer {
        nodeId
        name
      }
    }
  }
`;

const CreateResponsibility = ({ needId }) => {
  const router = useRouter();
  const intl = useIntl();
  const realitiesApollo = getRealitiesApollo();
  const [createResponsibility] = useMutation(CREATE_RESPONSIBILITY, {
    client: realitiesApollo,
    update: (cache, { data: { createResponsibility: createRespRes } }) => {
      cache.writeQuery({
        query: CACHE_QUERY,
        data: {
          showCreateResponsibility: false,
        },
      });
      const { responsibilities } = cache.readQuery({
        query: GET_RESPONSIBILITIES,
        variables: { needId },
      });

      const alreadyExists =
        responsibilities.filter((resp) => resp.nodeId === createRespRes.nodeId)
          .length > 0;

      if (!alreadyExists) {
        cache.writeQuery({
          query: GET_RESPONSIBILITIES,
          variables: { needId },
          data: {
            responsibilities: [createRespRes, ...responsibilities],
          },
        });
      }
    },
  });

  return (
    <Formik
      initialValues={{ title: "" }}
      validationSchema={yup.object().shape({
        title: yup
          .string()
          .required(
            intl.formatMessage({ defaultMessage: "Title is required" })
          ),
      })}
      onSubmit={(values, { resetForm }) => {
        createResponsibility({
          variables: {
            title: values.title,
            needId,
          },
        }).then(({ data }) => {
          resetForm();
          router.push(`/realities/${data.createResponsibility.nodeId}`);
        });
      }}
    >
      {({ values, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <ListForm
          inputName="title"
          placeholder={intl.formatMessage({
            defaultMessage: "Enter a title for the new responsibility...",
          })}
          value={values.title}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </Formik>
  );
};

CreateResponsibility.propTypes = {
  needId: PropTypes.string.isRequired,
};

export default CreateResponsibility;
