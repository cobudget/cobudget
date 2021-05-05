import React from "react";
import PropTypes from "prop-types";
import { gql, useMutation } from "@apollo/client";
import * as yup from "yup";
//import { useHistory, useParams } from "react-router-dom";
import { Formik } from "formik";
import { GET_RESPONSIBILITIES, CACHE_QUERY } from "lib/realities/queries";
import getRealitiesApollo from "lib/realities/getRealitiesApollo";
import ListForm from "./ListForm";

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
  const realitiesApollo = getRealitiesApollo();
  //const history = useHistory();
  //const params = useParams();
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
        title: yup.string().required("Title is required"),
      })}
      onSubmit={(values, { resetForm }) => {
        createResponsibility({
          variables: {
            title: values.title,
            needId,
          },
        }).then(({ data }) => {
          resetForm();
          //history.push(
          //  `/${params.orgSlug}/${data.createResponsibility.nodeId}`
          //);
        });
      }}
    >
      {({ values, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <ListForm
          inputName="title"
          placeholder="Enter a title for the new responsibility..."
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
