import React from "react";
import PropTypes from "prop-types";
import { gql } from "@apollo/client";
import styled from "styled-components";
import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import { TextField } from "@material-ui/core";
import TypeaheadInput from "./TypeaheadInput";

function personToString(person) {
  if (!person) return "";
  return person.name ? `${person.name} (${person.email})` : person.email;
}

const SEARCH_PERSON = gql`
  query EditDetailsForm_searchPersons($term: String!) {
    persons(search: $term) {
      nodeId
      name
      email
    }
  }
`;

const StyledForm = styled(Form)`
  margin-bottom: 1rem;
`;

const EditDetailsForm = ({
  isResp,
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  setFieldValue,
  isSubmitting,
  cancel,
}) => (
  <form onSubmit={handleSubmit} className="space-y-4 pt-4">
    <FormGroup>
      <TextField
        label="Title"
        variant="outlined"
        name="title"
        id="editDetailsTitle"
        value={values.title}
        disabled={isSubmitting}
        onChange={handleChange}
        onBlur={handleBlur}
        invalid={touched.title && !!errors.title}
      />
      <FormFeedback>{touched.title && errors.title}</FormFeedback>
    </FormGroup>
    <div className="grid grid-cols-2 gap-3">
      <div className={`col-span-full ${isResp ? "md:col-span-1" : ""}`}>
        <FormGroup>
          <TypeaheadInput
            label="Guide"
            name="guide"
            id="editDetailsGuide"
            selectedItem={values.guide}
            itemToString={personToString}
            searchQuery={SEARCH_PERSON}
            queryDataToResultsArray={(data) => data.persons}
            onChange={(value) => setFieldValue("guide", value)}
            onBlur={handleBlur}
            disabled={isSubmitting}
            invalid={touched.guide && !!errors.guide}
          />
          <FormFeedback
            className={touched.guide && !!errors.guide ? "d-block" : ""}
          >
            {touched.guide && errors.guide}
          </FormFeedback>
        </FormGroup>
      </div>
      {isResp && (
        <div className="col-span-full md:col-span-1">
          <TypeaheadInput
            label="Realizer"
            name="realizer"
            id="editDetailsRealizer"
            selectedItem={values.realizer}
            itemToString={personToString}
            searchQuery={SEARCH_PERSON}
            queryDataToResultsArray={(data) => data.persons}
            onChange={(value) => setFieldValue("realizer", value)}
            onBlur={handleBlur}
            disabled={isSubmitting}
            invalid={touched.realizer && !!errors.realizer}
          />
          <FormFeedback
            className={touched.realizer && !!errors.realizer ? "d-block" : ""}
          >
            {touched.realizer && errors.realizer}
          </FormFeedback>
        </div>
      )}
    </div>
    <FormGroup>
      <Label for="editDetailsDescription">Description</Label>
      <Input
        name="description"
        id="editDetailsDescription"
        type="textarea"
        rows={3}
        value={values.description}
        disabled={isSubmitting}
        onChange={handleChange}
        onBlur={handleBlur}
        invalid={touched.description && errors.description}
      />
      <FormFeedback>{touched.description && errors.description}</FormFeedback>
    </FormGroup>
    <div>
      <Button type="submit" color="primary" disabled={isSubmitting}>
        Save
      </Button>
      <Button color="link" onClick={cancel} disabled={isSubmitting}>
        Cancel
      </Button>
    </div>
  </form>
);

EditDetailsForm.propTypes = {
  isResp: PropTypes.bool,
  values: PropTypes.shape({
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
  }),
  errors: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    guide: PropTypes.string,
    realizer: PropTypes.string,
  }),
  touched: PropTypes.shape({
    title: PropTypes.bool,
    description: PropTypes.bool,
    guide: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.shape({
        nodeId: PropTypes.bool,
        email: PropTypes.bool,
        name: PropTypes.bool,
      }),
    ]),
    realizer: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.shape({
        nodeId: PropTypes.bool,
        email: PropTypes.bool,
        name: PropTypes.bool,
      }),
    ]),
  }),
  handleChange: PropTypes.func,
  handleBlur: PropTypes.func,
  handleSubmit: PropTypes.func,
  setFieldValue: PropTypes.func,
  isSubmitting: PropTypes.bool,
  cancel: PropTypes.func,
};

EditDetailsForm.defaultProps = {
  isResp: false,
  values: {
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
  },
  errors: {
    title: "",
    description: "",
    guide: "",
    realizer: "",
  },
  touched: {
    title: false,
    description: false,
    guide: {
      nodeId: false,
      email: false,
      name: false,
    },
    realizer: {
      nodeId: false,
      email: false,
      name: false,
    },
  },
  handleChange: () => null,
  handleBlur: () => null,
  handleSubmit: () => null,
  setFieldValue: () => null,
  isSubmitting: false,
  cancel: () => null,
};

export default EditDetailsForm;
