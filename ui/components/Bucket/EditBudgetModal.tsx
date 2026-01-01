import { useMutation, gql } from "urql";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Modal } from "@mui/material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import TextField from "components/TextField";
import Button from "components/Button";
import IconButton from "components/IconButton";
import { DeleteIcon, AddIcon, DraggableIcon } from "components/Icons";
import { FormattedMessage, useIntl } from "react-intl";

import * as yup from "yup";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const EDIT_BUDGET_MUTATION = gql`
  mutation EditBudget($bucketId: ID!, $budgetItems: [BudgetItemInput]) {
    editBucket(bucketId: $bucketId, budgetItems: $budgetItems) {
      id
      minGoal
      maxGoal
      income
      budgetItems {
        id
        description
        min
        max
        type
        position
      }
    }
  }
`;

const schema = yup.object().shape({
  budgetItems: yup.array().of(
    yup.object().shape({
      id: yup.string().optional(),
      description: yup.string().required(),
      min: yup.number().integer().min(0).required(),
      max: yup
        .number()
        .transform((cv) => (isNaN(cv) ? undefined : cv))
        .nullable()
        .min(0)
        .integer()
        .moreThan(
          yup.ref("min"),
          "Max amount should be greater than min amount"
        ),
      type: yup.string().required(),
    })
  ),
});

const SortableBudgetItem = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col sm:flex-row my-2">
      <div
        {...listeners}
        {...attributes}
        className="cursor-move flex items-center mr-2 text-gray-400 hover:text-gray-600"
      >
        <DraggableIcon className="h-5 w-5" />
      </div>
      {children}
    </div>
  );
};

const EditBudgetModal = ({
  bucket,
  budgetItems,
  currency,
  allowStretchGoals,
  handleClose,
  open,
}) => {
  const [{ fetching: loading }, editBucket] = useMutation(EDIT_BUDGET_MUTATION);
  const [maxAmountOpenInputs, setMaxAmountOpenInputs] = useState({});
  const intl = useIntl();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { handleSubmit, register, control } = useForm({
    resolver: yupResolver(schema),
    // Convert cents to display units for form state (e.g., 30000 cents → 300)
    defaultValues: {
      budgetItems: budgetItems.map((item) => ({
        ...item,
        min: typeof item.min !== "undefined" ? item.min / 100 : undefined,
        max: typeof item.max !== "undefined" && item.max !== null ? item.max / 100 : undefined,
      })),
    },
  });

  const { fields, append, insert, remove, move } = useFieldArray({
    control,
    name: "budgetItems",
    keyName: "fieldId",
  });

  const incomeItems = fields
    .map((field, originalIndex) => ({ ...field, originalIndex }))
    .filter((field) => field.type === "INCOME");
  const expenseItems = fields
    .map((field, originalIndex) => ({ ...field, originalIndex }))
    .filter((field) => field.type === "EXPENSE");

  const checkErrors = (errors) => {
    if (errors?.budgetItems?.length > 0) {
      // Find the first non-undefined error in the array
      const firstError = errors.budgetItems.find((e) => e !== undefined && e !== null);
      if (!firstError) {
        return;
      }
      const errKeys = Object.keys(firstError);
      if (errKeys.length === 0) {
        return;
      }
      toast.error(firstError[errKeys[0]].message);
    }
  };

  useEffect(() => {
    const opened = {};
    budgetItems.forEach((item, i) => {
      if (item.max) opened[item.id] = true;
    });
    setMaxAmountOpenInputs(opened);
  }, [budgetItems]);

  //for new rows, this function returns an id
  const getPreId = useCallback((type, index) => {
    return `${type}-${index}`;
  }, []);

  const handleExpenseDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = expenseItems.findIndex((item) => item.fieldId === active.id);
    const newIndex = expenseItems.findIndex((item) => item.fieldId === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const fromOriginalIndex = expenseItems[oldIndex].originalIndex;
      const toOriginalIndex = expenseItems[newIndex].originalIndex;
      move(fromOriginalIndex, toOriginalIndex);
    }
  };

  const handleIncomeDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = incomeItems.findIndex((item) => item.fieldId === active.id);
    const newIndex = incomeItems.findIndex((item) => item.fieldId === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const fromOriginalIndex = incomeItems[oldIndex].originalIndex;
      const toOriginalIndex = incomeItems[newIndex].originalIndex;
      move(fromOriginalIndex, toOriginalIndex);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex items-start justify-center p-4 md:pt-16 overflow-y-scroll max-h-screen"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-md">
        <h1 className="text-xl font-semibold mb-4">
          <FormattedMessage defaultMessage="Edit budget" />
        </h1>
        <form
          onSubmit={handleSubmit((variables) => {
            const budgetTypeCount = {
              EXPENSE: 0,
              INCOME: 0,
            };
            const budgetItemsToSend = variables.budgetItems?.map((item, i) => {
              const preId = getPreId(item.type, budgetTypeCount[item.type]);
              budgetTypeCount[item.type]++;
              return {
                ...item,
                id: undefined,
                min: Math.round(item.min * 100),
                position: i,
                ...(item.max &&
                  maxAmountOpenInputs[item.id || preId] && {
                    max: Math.round(item.max * 100),
                  }),
              };
            }) ?? [];
            editBucket({
              bucketId: bucket.id,
              budgetItems: budgetItemsToSend,
            })
              .then(() => {
                handleClose();
              })
              .catch((err) => alert(err.message));
          }, checkErrors)}
        >
          <h2 className="text-lg font-semibold mb-2">
            <FormattedMessage defaultMessage="Costs" />
          </h2>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleExpenseDragEnd}
          >
            <SortableContext
              items={expenseItems.map((item) => item.fieldId)}
              strategy={verticalListSortingStrategy}
            >
              {expenseItems.map(
                ({ id, fieldId, description, type, min, max, originalIndex }, i) => {
                  const descField = register(`budgetItems.${originalIndex}.description`);
                  const minField = register(`budgetItems.${originalIndex}.min`);
                  const maxField = register(`budgetItems.${originalIndex}.max`);
                  return (
                    <SortableBudgetItem key={fieldId} id={fieldId}>
                      <div className="mr-2 my-2 sm:my-0 flex-1">
                        <input
                          value={id}
                          readOnly
                          className="hidden"
                          {...register(`budgetItems.${originalIndex}.id`)}
                        />
                        <TextField
                          placeholder={intl.formatMessage({
                            defaultMessage: "Description",
                          })}
                          defaultValue={description}
                          name={descField.name}
                          inputRef={descField.ref}
                          inputProps={{ onChange: descField.onChange, onBlur: descField.onBlur }}
                          testid={`bucket-expense-item-description`}
                        />
                        <input
                          value={type}
                          {...register(`budgetItems.${originalIndex}.type`)}
                          readOnly
                          className="hidden"
                        />
                      </div>
                      <div className="mr-2 my-2 sm:my-0 flex-1">
                        <TextField
                          placeholder={
                            allowStretchGoals
                              ? intl.formatMessage({ defaultMessage: "Min amount" })
                              : intl.formatMessage({ defaultMessage: "Amount" })
                          }
                          defaultValue={
                            typeof min !== "undefined" ? String(min) : null
                          }
                          name={minField.name}
                          inputRef={minField.ref}
                          inputProps={{ onChange: minField.onChange, onBlur: minField.onBlur, type: "number", min: 0 }}
                          endAdornment={currency}
                          testid={`bucket-expense-item-min-amount`}
                        />
                      </div>

                      {allowStretchGoals && (
                        <div className="mr-2 my-2 sm:my-0 flex-1 relative">
                          {maxAmountOpenInputs[id || getPreId(type, i)] ? (
                            <>
                              <TextField
                                placeholder={intl.formatMessage({
                                  defaultMessage: "Max amount",
                                })}
                                defaultValue={
                                  typeof max === "undefined" || max === null
                                    ? null
                                    : String(max)
                                }
                                name={maxField.name}
                                inputRef={maxField.ref}
                                inputProps={{ onChange: maxField.onChange, onBlur: maxField.onBlur, type: "number", min: 0 }}
                                endAdornment={currency}
                              />
                              <span
                                className="absolute -right-2 -top-2 bg-gray-200 rounded-full flex items-center justify-center h-6 w-6 cursor-pointer"
                                onClick={() => {
                                  setMaxAmountOpenInputs({
                                    ...maxAmountOpenInputs,
                                    [id || getPreId(type, i)]: false,
                                  });
                                }}
                              >
                                ✖
                              </span>
                            </>
                          ) : (
                            <p
                              onClick={() => {
                                setMaxAmountOpenInputs({
                                  ...maxAmountOpenInputs,
                                  [id || getPreId(type, i)]: true,
                                });
                              }}
                              className="underline cursor-pointer mt-4 text-sm text-color-gray"
                            >
                              <FormattedMessage defaultMessage="+ Add a range" />
                            </p>
                          )}
                        </div>
                      )}
                      <div className="my-2">
                        <IconButton onClick={() => remove(originalIndex)}>
                          <DeleteIcon className="h-6 w-6 text-color-red" />
                        </IconButton>
                      </div>
                    </SortableBudgetItem>
                  );
                }
              )}
            </SortableContext>
          </DndContext>
          <div className="flex mb-4">
            <Button
              variant="secondary"
              color={bucket.round.color}
              onClick={() => append({ type: "EXPENSE" })}
              className="flex-grow"
              testid="add-bucket-cost-button"
            >
              <AddIcon className="h-5 w-5 mr-1" />{" "}
              <FormattedMessage defaultMessage="Add row" />
            </Button>
          </div>

          <h2 className="text-lg font-semibold my-2">
            <FormattedMessage defaultMessage="Existing funding and resources" />
          </h2>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleIncomeDragEnd}
          >
            <SortableContext
              items={incomeItems.map((item) => item.fieldId)}
              strategy={verticalListSortingStrategy}
            >
              {incomeItems.map(({ id, fieldId, description, type, min, originalIndex }) => {
                const descField = register(`budgetItems.${originalIndex}.description`);
                const minField = register(`budgetItems.${originalIndex}.min`);
                return (
                  <SortableBudgetItem key={fieldId} id={fieldId}>
                    <div className="mr-2 my-2 sm:my-0 flex-grow">
                      <input
                        value={id}
                        readOnly
                        className="hidden"
                        {...register(`budgetItems.${originalIndex}.id`)}
                      />
                      <TextField
                        placeholder={intl.formatMessage({
                          defaultMessage: "Description",
                        })}
                        name={descField.name}
                        inputRef={descField.ref}
                        inputProps={{ onChange: descField.onChange, onBlur: descField.onBlur }}
                        defaultValue={description}
                        testid={`bucket-existing-item-${fieldId}-description`}
                      />
                      <input
                        value={type}
                        {...register(`budgetItems.${originalIndex}.type`)}
                        readOnly
                        className="hidden"
                      />
                    </div>

                    <div className="mr-2 my-2 sm:my-0">
                      <TextField
                        placeholder={intl.formatMessage({
                          defaultMessage: "Amount",
                        })}
                        defaultValue={
                          typeof min !== "undefined" ? String(min) : null
                        }
                        name={minField.name}
                        inputRef={minField.ref}
                        inputProps={{ onChange: minField.onChange, onBlur: minField.onBlur, type: "number", min: 0 }}
                        endAdornment={currency}
                        testid={`bucket-existing-item-${fieldId}-amount`}
                      />
                    </div>

                    <div className="my-2">
                      <IconButton onClick={() => remove(originalIndex)}>
                        <DeleteIcon className="h-6 w-6 text-color-red" />
                      </IconButton>
                    </div>
                  </SortableBudgetItem>
                );
              })}
            </SortableContext>
          </DndContext>
          <div className="flex mb-2">
            <Button
              variant="secondary"
              color={bucket.round.color}
              onClick={() =>
                insert(fields.filter((f) => f.type === "INCOME").length, {
                  type: "INCOME",
                })
              }
              className="flex-grow"
            >
              <AddIcon className="h-5 w-5 mr-1" />{" "}
              <FormattedMessage defaultMessage="Add row" />
            </Button>
          </div>

          {/* <div>
            Total funding goal: {thousandSeparator(minGoal)} {currency}
          </div> */}

          <div className="flex justify-between items-center">
            <div className="pl-4">
              {Boolean(bucket.round.guidelines.length) && (
                <a
                  href={`/${bucket.round.group?.slug ?? "c"}/${
                    bucket.round.slug
                  }/about#guidelines`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-600 font-medium hover:text-gray-800"
                >
                  <FormattedMessage defaultMessage="See funding guidelines" />
                </a>
              )}
            </div>
            <div className="flex">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="mr-2"
              >
                <FormattedMessage defaultMessage="Cancel" />
              </Button>
              <Button
                type="submit"
                loading={loading}
                testid="add-budget-submit-buton"
              >
                <FormattedMessage defaultMessage="Save" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditBudgetModal;
