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
          size="small"
          placeholder={intl.formatMessage({
            defaultMessage: "Description",
          })}
          inputRef={register(`receipts.${index}.description`).ref}
          inputProps={register(`receipts.${index}.description`)}
          autoFocus
          error={Boolean(errors.receipts?.[index]?.description)}
          helperText={errors.receipts?.[index]?.description?.message}
        />
      </div>

      <div className="flex flex-col sm:flex-row mt-2">
        <div className="mr-2 sm:my-0 flex-1">
          <TextField
            className="my-1"
            size="small"
            placeholder={intl.formatMessage({
              defaultMessage: "Date",
            })}
            inputRef={register(`receipts.${index}.date`).ref}
            inputProps={{ ...register(`receipts.${index}.date`), type: "date" }}
            error={Boolean(errors.receipts?.[index]?.date)}
            helperText={errors.receipts?.[index]?.date?.message}
          />
        </div>
        <div className="mr-2 sm:my-0 flex-1">
          <TextField
            className="my-1"
            size="small"
            placeholder={intl.formatMessage({
              defaultMessage: "Amount",
            })}
            inputRef={register(`receipts.${index}.amount`).ref}
            inputProps={{ ...register(`receipts.${index}.amount`), type: "number", min: 0 }}
            error={Boolean(errors.receipts?.[index]?.amount)}
            helperText={errors.receipts?.[index]?.amount?.message}
            endAdornment={round.currency}
          />
        </div>
      </div>
    </>
  );
}

export default AddReceiptForm;
