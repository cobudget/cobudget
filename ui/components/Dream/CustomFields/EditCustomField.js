import TextField from "../../TextField";
import HiddenTextField from "../../HiddenTextField";
import SelectInput from "../../SelectInput";

export default ({ defaultCustomField, fieldName, defaultValue, register}) => {
  return (
    <div className={`flex flex-col sm:flex-row my-2`} key={defaultCustomField.id}>
      <div className="mr-2 my-2 sm:my-0 flex-grow">
        { defaultCustomField.name }
        <br />
        { defaultCustomField.description }
      </div>
      <HiddenTextField
        name={`${fieldName}.fieldId`}
        defaultValue={defaultCustomField.id}
        inputRef={register()}
      />
      <div className="mr-2 my-2 sm:my-0 flex-grow">
        { defaultCustomField.type === 'TEXT' || defaultCustomField.type === 'MULTILINE_TEXT' ? (
          <TextField
            placeholder="Value"
            name={`${fieldName}.value`}
            defaultValue={defaultValue}
            multiline = {defaultCustomField.type == 'MULTILINE_TEXT'}
            inputRef={register({
              required: defaultCustomField.isRequired ? "Required" : null,
            })}
          />
        ) : (defaultCustomField.type === 'BOOLEAN')? (
          <SelectInput
              name={`${fieldName}.value`}
              defaultValue={defaultValue}
              inputRef={register}
              fullWidth
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
          </SelectInput>
        ): null
        }
      </div>
    </div>
  )
}