import React from "react";
import PropTypes from "prop-types";
import { gql, useMutation } from "@apollo/client";
import * as yup from "yup";
import { Formik } from "formik";
import getRealitiesApollo from "lib/realities/getRealitiesApollo";
import EditDetailsForm from "./EditDetailsForm";
import { FormattedMessage, useIntl, } from "react-intl";

const createEditDetailsMutation = (nodeType, isResp) => gql`
  mutation EditDetailsContainer_update${nodeType}(
    $nodeId: ID!
    $title: String!
    $guideEmail: String!
    ${isResp ? "$realizerEmail: String" : ""}
    $description: String
  ) {
    update${nodeType}(
      nodeId: $nodeId
      title: $title
      guideEmail: $guideEmail
      ${isResp ? "realizerEmail: $realizerEmail" : ""}
      description: $description
    ) {
      nodeId
      title
      description
      guide {
        nodeId
        email
        name
      }
      ${
        isResp
          ? `realizer {
        nodeId
        email
        name
      }`
          : ""
      }
    }
  }
`;

const EditDetailsContainer = ({ node, isResp, stopEdit }) => {
  const realitiesApollo = getRealitiesApollo();
  const [updateNode] = useMutation(
    createEditDetailsMutation(node.__typename, isResp),
    { client: realitiesApollo }
  );

  return (
    <Formik
      initialValues={{
        title: node.title || "",
        guide: node.guide || null,
        realizer: node.realizer || null,
        description: node.description || "",
      }}
      enableReinitialize
      validationSchema={yup.object().shape({
        title: yup.string().required(intl.formatMessage({ defaultMessage:"Title is required" })),
        guide: yup
          .object()
          .shape({
            email: yup.string().required(),
          })
          .typeError(intl.formatMessage({ defaultMessage:"Guide is required"}))
          .required(),
        realizer: yup
          .object()
          .shape({
            email: yup.string(),
          })
          .nullable(),
        description: yup.string().nullable(),
      })}
      onSubmit={(values, { resetForm }) => {
        updateNode({
          variables: {
            nodeId: node.nodeId,
            title: values.title,
            guideEmail: values.guide && values.guide.email,
            realizerEmail: values.realizer && values.realizer.email,
            description: values.description,
          },
        }).then(() => {
          resetForm();
          stopEdit();
        });
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        isSubmitting,
      }) => (
        <EditDetailsForm
          isResp={isResp}
          values={values}
          errors={errors}
          touched={touched}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handleSubmit={handleSubmit}
          setFieldValue={setFieldValue}
          isSubmitting={isSubmitting}
          cancel={stopEdit}
        />
      )}
    </Formik>
  );
};

EditDetailsContainer.propTypes = {
  node: PropTypes.shape({
    __typename: PropTypes.string,
    nodeId: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    guide: PropTypes.shape({
      nodeId: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
    }),
    realizer: PropTypes.shape({
      nodeId: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
    }),
    dependsOnResponsibilities: PropTypes.arrayOf(
      PropTypes.shape({
        __typename: PropTypes.string,
        nodeId: PropTypes.string,
        title: PropTypes.string,
        fulfills: PropTypes.shape({
          nodeId: PropTypes.string,
        }),
      })
    ),
  }),
  isResp: PropTypes.bool,
  stopEdit: PropTypes.func,
};

EditDetailsContainer.defaultProps = {
  node: {
    nodeId: "",
    title: "",
    description: "",
    guide: {
      nodeId: "",
      email: "",
      name: "",
    },
    realizer: {
      nodeId: "",
      email: "",
      name: "",
    },
    dependsOnResponsibilities: [],
  },
  isResp: false,
  stopEdit: () => null,
};

export default EditDetailsContainer;
