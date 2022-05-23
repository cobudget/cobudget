import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { gql, useMutation } from "@apollo/client";
import { Formik } from "formik";
import * as yup from "yup";
import { FaUnlink } from "react-icons/fa";
import getRealitiesApollo from "lib/realities/getRealitiesApollo";
import InfoForm from "./InfoForm";
import { FormattedMessage, useIntl } from "react-intl";

const ADD_RESP_HAS_DELIBERATION = gql`
  mutation AddRespHasDeliberation_addHasDeliberationMutation(
    $from: _ResponsibilityInput!
    $to: _InfoInput!
  ) {
    addRespHasDeliberation(from: $from, to: $to) {
      from {
        nodeId
        deliberations {
          nodeId
          title
          url
        }
      }
    }
  }
`;

const InvalidUrlText = styled.span`
  color: #ff0000;
  font-weight: bold;
`;

const AddDeliberation = ({ nodeId }) => {
  const intl = useIntl();
  const realitiesApollo = getRealitiesApollo();
  const [createDeliberation] = useMutation(ADD_RESP_HAS_DELIBERATION, {
    client: realitiesApollo,
  });

  return (
    <div>
      <Formik
        initialValues={{ url: "" }}
        validationSchema={yup.object().shape({
          url: yup
            .string()
            .required(intl.formatMessage({ defaultMessage: "URL is required" }))
            .url(intl.formatMessage({ defaultMessage: "Invalid URL" })),
        })}
        onSubmit={(values, { resetForm }) => {
          createDeliberation({
            variables: { from: { nodeId }, to: { url: values.url } },
          }).then(() => {
            resetForm();
          });
        }}
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          errors,
          touched,
        }) => (
          <div>
            <InfoForm
              label={intl.formatMessage({
                defaultMessage: "Add a discussion reference",
              })}
              inputName="url"
              placeholder={intl.formatMessage({
                defaultMessage: "Enter a discussion URL...",
              })}
              value={values.url}
              handleChange={handleChange}
              handleBlur={handleBlur}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
            {touched.url && errors.url && (
              <InvalidUrlText>
                <FaUnlink /> {errors.url}
              </InvalidUrlText>
            )}
          </div>
        )}
      </Formik>
    </div>
  );
};

AddDeliberation.propTypes = {
  nodeId: PropTypes.string,
};

AddDeliberation.defaultProps = {
  nodeId: "",
};

export default AddDeliberation;
