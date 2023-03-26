import TextField from "components/TextField";
import React from "react";
import { useIntl } from "react-intl";

function AddReceiptForm({ index, register, errors, round }) {
  const intl = useIntl();

  return (
    <>
      <div className="mt-2">
        <TextField
          className="my-1"
          name="description"
          size="small"
          placeholder={intl.formatMessage({
            defaultMessage: "Description",
          })}
          inputRef={register("description.0")}
          autoFocus
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
        />
      </div>

      <div className="flex flex-col sm:flex-row mt-2">
        <div className="mr-2 sm:my-0 flex-1">
          <TextField
            className="my-1"
            name="date"
            size="small"
            placeholder={intl.formatMessage({
              defaultMessage: "Date",
            })}
            inputRef={register({})}
            inputProps={{ type: "date" }}
            error={Boolean(errors.date)}
            helperText={errors.date?.message}
          />
        </div>
        <div className="mr-2 sm:my-0 flex-1">
          <TextField
            className="my-1"
            name="amount"
            size="small"
            placeholder={intl.formatMessage({
              defaultMessage: "Amount",
            })}
            inputRef={register({})}
            inputProps={{ type: "number", min: 0 }}
            error={Boolean(errors.amount)}
            helperText={errors.amount?.message}
            endAdornment={round.currency}
          />
        </div>
      </div>
    </>
  );
}

export default AddReceiptForm;
