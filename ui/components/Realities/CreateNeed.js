import React from "react";
import { gql, useMutation } from "@apollo/client";
import * as yup from "yup";
import { Formik } from "formik";
import { GET_NEEDS, CACHE_QUERY } from "lib/realities/queries";
import ListForm from "./ListForm";

const CREATE_NEED = gql`
  mutation CreateNeed_createNeedMutation($title: String!) {
    createNeed(title: $title) {
      nodeId
      title
      fulfilledBy {
        nodeId
        title
        realizer {
          nodeId
          name
        }
      }
    }
  }
`;

const CreateNeed = () => {
  //const history = useHistory();
  //const { orgSlug } = useParams();

  const [createNeed] = useMutation(CREATE_NEED, {
    update: (cache, { data: { createNeed: createNeedRes } }) => {
      cache.writeQuery({
        query: CACHE_QUERY,
        data: {
          showCreateNeed: false,
        },
      });
      const { needs } = cache.readQuery({ query: GET_NEEDS });

      const alreadyExists =
        needs.filter((need) => need.nodeId === createNeedRes.nodeId).length > 0;
      if (!alreadyExists) {
        cache.writeQuery({
          query: GET_NEEDS,
          data: { needs: [createNeedRes, ...needs] },
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
        createNeed({ variables: { title: values.title } }).then(({ data }) => {
          resetForm();
          //TODO
          //history.push(`/${orgSlug}/need/${data.createNeed.nodeId}`);
        });
      }}
    >
      {({ values, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <ListForm
          inputName="title"
          placeholder="Enter a title for the new need..."
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

export default CreateNeed;
