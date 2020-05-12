import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import Router from "next/router";

import {
  TextField,
  Box,
  InputAdornment,
  Typography,
  Button,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import ImageUpload from "./ImageUpload";
import EditBudgetItems from "./EditBudgetItems";
import Cocreators from "./Cocreators";

import slugify from "../utils/slugify";

const CREATE_DREAM = gql`
  mutation CreateDream(
    $eventId: ID!
    $title: String!
    $slug: String!
    $description: String
    $summary: String
    $images: [ImageInput]
    $minGoal: Int
    $maxGoal: Int
    $budgetItems: [BudgetItemInput]
  ) {
    createDream(
      eventId: $eventId
      title: $title
      slug: $slug
      description: $description
      summary: $summary
      images: $images
      minGoal: $minGoal
      maxGoal: $maxGoal
      budgetItems: $budgetItems
    ) {
      id
      slug
      description
      summary
      title
      minGoal
      maxGoal
      minGoalGrants
      maxGoalGrants
      currentNumberOfGrants
      approved
      cocreators {
        id
        user {
          id
          name
        }
      }
      images {
        small
        large
      }
      numberOfComments
      comments {
        id
        content
        createdAt
        author {
          id
          name
          avatar
        }
      }
      budgetItems {
        description
        amount
      }
    }
  }
`;

const EDIT_DREAM = gql`
  mutation EDIT_DREAM(
    $dreamId: ID!
    $title: String!
    $slug: String!
    $description: String
    $summary: String
    $images: [ImageInput]
    $minGoal: Int
    $maxGoal: Int
    $budgetItems: [BudgetItemInput]
  ) {
    editDream(
      dreamId: $dreamId
      title: $title
      slug: $slug
      description: $description
      summary: $summary
      images: $images
      minGoal: $minGoal
      maxGoal: $maxGoal
      budgetItems: $budgetItems
    ) {
      id
      slug
      description
      summary
      title
      minGoal
      maxGoal
      minGoalGrants
      maxGoalGrants
      currentNumberOfGrants
      approved
      cocreators {
        id
        user {
          id
          name
        }
      }
      images {
        small
        large
      }
      numberOfComments
      comments {
        id
        content
        createdAt
        author {
          id
          name
          avatar
        }
      }
      budgetItems {
        description
        amount
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  row: {
    margin: "16px 0",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridGap: theme.spacing(2),
  },
  [theme.breakpoints.down("xs")]: {
    row: {
      gridTemplateColumns: "1fr",
    },
  },
}));

export default ({ dream = {}, event, editing }) => {
  const classes = useStyles();

  const [editDream] = useMutation(EDIT_DREAM);
  const [createDream] = useMutation(CREATE_DREAM);

  const { handleSubmit, register, errors } = useForm();

  const {
    title = "",
    slug = "",
    description = "",
    summary = "",
    minGoal = "",
    maxGoal = "",
  } = dream;

  // // //

  // ok so.. what do we do..

  // seek for members to add.
  // searching for members to add.

  const [slugValue, setSlugValue] = useState(slug);
  const [images, setImages] = useState(dream.images ? dream.images : []);

  const [cocreators, setCocreators] = useState(dream.cocreators);
  const addCocreator = (member) => setCocreators([...cocreators, member]);
  const removeCocreator = (id) =>
    setCocreators(cocreators.filter((member) => member.id !== id));

  const [budgetItems, setBudgetItems] = useState(
    dream.budgetItems ? dream.budgetItems : []
  );
  const addBudgetItem = () =>
    setBudgetItems([...budgetItems, { description: "", value: "" }]);
  const removeBudgetItem = (i) =>
    setBudgetItems([...budgetItems.filter((item, index) => i !== index)]);

  const onSubmitCreate = (values) => {
    createDream({
      variables: {
        eventId: event.id,
        ...values,
        minGoal: values.minGoal === "" ? null : Number(values.minGoal),
        maxGoal: values.maxGoal === "" ? null : Number(values.maxGoal),
        images,
        cocreators,
      },
    })
      .then(({ data }) => {
        Router.push(
          "/[event]/[dream]",
          `/${event.slug}/${data.createDream.slug}`
        );
      })
      .catch((err) => {
        console.log({ err });
        alert(err.message);
      });
  };

  const onSubmitEdit = (values) => {
    images.forEach((image) => delete image.__typename); // apollo complains otherwise..
    editDream({
      variables: {
        dreamId: dream.id,
        ...values,
        minGoal: values.minGoal === "" ? null : Number(values.minGoal),
        maxGoal: values.maxGoal === "" ? null : Number(values.maxGoal),
        images,
        cocreators,
      },
    })
      .then(({ data }) => {
        Router.push(
          "/[event]/[dream]",
          `/${event.slug}/${data.editDream.slug}`
        );
      })
      .catch((err) => {
        console.log({ err });
        alert(err.message);
      });
  };

  return (
    <form onSubmit={handleSubmit(editing ? onSubmitEdit : onSubmitCreate)}>
      <Box my={2}>
        <TextField
          name="title"
          label="Title"
          defaultValue={title}
          fullWidth
          inputRef={register({
            required: "Required",
          })}
          InputProps={{
            onChange: (e) => {
              if (!editing) setSlugValue(slugify(e.target.value));
            },
          }}
          variant="outlined"
          error={Boolean(errors.title)}
          helperText={errors.title && errors.title.message}
        />
      </Box>
      <Box my={2}>
        <TextField
          name="slug"
          label="Slug"
          value={slugValue}
          fullWidth
          inputRef={register({
            required: "Required",
          })}
          InputProps={{
            onChange: (e) => setSlugValue(e.target.value),
            onBlur: (e) => setSlugValue(slugify(e.target.value)),
          }}
          variant="outlined"
          error={Boolean(errors.slug)}
          helperText={errors.slug && errors.slug.message}
        />
      </Box>

      <Box my={2}>
        <TextField
          name="summary"
          label="Summary"
          defaultValue={summary}
          fullWidth
          inputRef={register({
            required: "Required",
          })}
          inputProps={{ maxLength: 180 }}
          multiline
          variant="outlined"
          error={Boolean(errors.summary)}
          helperText={errors.summary && errors.summary.message}
        />
      </Box>

      <ImageUpload images={images} setImages={setImages} />

      <Box my={2}>
        <TextField
          name="description"
          label="Description"
          defaultValue={description}
          fullWidth
          inputRef={register}
          multiline
          rows={15}
          variant="outlined"
        />
      </Box>

      <h2>Co-creators</h2>
      <Cocreators
        addCocreator={addCocreator}
        removeCocreator={removeCocreator}
        cocreators={cocreators}
        event={event}
      />

      <Typography variant="h6">Funding goals</Typography>

      <Box my={2} className={classes.row}>
        <TextField
          name="minGoal"
          label="Min funding goal"
          fullWidth
          defaultValue={minGoal}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{event.currency}</InputAdornment>
            ),
          }}
          inputProps={{ type: "number", min: 0 }}
          inputRef={register({ min: 0 })}
          variant="outlined"
        />
        <TextField
          name="maxGoal"
          label="Max funding goal"
          fullWidth
          defaultValue={maxGoal}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{event.currency}</InputAdornment>
            ),
          }}
          inputProps={{ type: "number", min: 0 }}
          inputRef={register({ min: 0 })}
          variant="outlined"
        />
      </Box>

      <EditBudgetItems
        event={event}
        register={register}
        errors={errors}
        budgetItems={budgetItems}
        addBudgetItem={addBudgetItem}
        removeBudgetItem={removeBudgetItem}
      />

      <Button variant="contained" color="primary" size="large" type="submit">
        Save
      </Button>
    </form>
  );
};
