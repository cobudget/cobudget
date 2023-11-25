import { SelectField } from "components/SelectInput";
import AppContext from "contexts/AppContext";
import React, { useContext } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useMutation } from "urql";

const CHANGE_FREE_STATUS = gql`
  mutation Mutation($groupId: ID!, $freeStatus: Boolean) {
    changeGroupFreeStatus(groupId: $groupId, freeStatus: $freeStatus) {
      id
      isFree
    }
  }
`;

function SuperAdmin({ group, currentUser }) {
  const [{ fetching: updatingStatis }, changeFreeStatus] = useMutation(
    CHANGE_FREE_STATUS
  );

  const { ss } = useContext(AppContext);
  const intl = useIntl();

  return (
    <div className="px-6 flex-1 space-y-4">
      <p className="text-2xl font-semibold">
        <FormattedMessage defaultMessage="Super Admin" />
      </p>
      <div>
        <div className="my-6">
          <SelectField
            name="isFree"
            className="my-4"
            label={intl.formatMessage({ defaultMessage: "Toggle Free" })}
            defaultValue={group?.isFree ? "YES" : "NO"}
            inputProps={{
              onChange: (e) => {
                changeFreeStatus({
                  freeStatus: e.target.value === "YES",
                  groupId: group?.id,
                });
              },
            }}
          >
            <option value={"YES"}>Yes</option>
            <option value={"NO"}>No</option>
          </SelectField>
        </div>
      </div>
    </div>
  );
}

export default SuperAdmin;
