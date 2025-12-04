import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import toast from "react-hot-toast";
import Avatar from "../Avatar";
import Button from "../Button";
import { FormattedMessage, useIntl } from "react-intl";

const RequestToJoinTable = ({
  requestsToJoin,
  updateMember,
  deleteMember,
  roundId,
}) => {
  const intl = useIntl();
  if (requestsToJoin.length === 0) return null;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-xl mb-3 font-semibold">
          <FormattedMessage
            defaultMessage="{count} requests to join"
            values={{
              count: requestsToJoin.length,
            }}
          />
        </h2>
        <div className="bg-white rounded-lg shadow">
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <FormattedMessage defaultMessage="User" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage defaultMessage="Email" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage defaultMessage="Bio" />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedMessage defaultMessage="Actions" />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requestsToJoin.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell component="th" scope="row">
                      <div className="flex space-x-3">
                        <Avatar user={member.user} />
                        <div>
                          <p className="font-medium text-base">{member.name}</p>
                          <p className="text-gray-700 text-sm">
                            @{member.user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell component="th" scope="row">
                      {member.bio}
                    </TableCell>
                    <TableCell align="right" padding="none">
                      <Box p="0 15px" display="flex" justifyContent="flex-end">
                        <Box m="0 8px 0">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              if (
                                confirm(
                                  intl.formatMessage({
                                    defaultMessage:
                                      "Are you sure you would like to delete this membership request?",
                                  })
                                )
                              ) {
                                deleteMember({
                                  roundId,
                                  memberId: member.id,
                                }).then(({ error }) => {
                                  if (error) {
                                    console.error(error);
                                    toast.error(error.message);
                                  }
                                });
                              }
                            }}
                          >
                            <FormattedMessage defaultMessage="Delete" />
                          </Button>
                        </Box>

                        <Button
                          // variant="primary"
                          onClick={() => {
                            if (
                              confirm(
                                intl.formatMessage({
                                  defaultMessage:
                                    "Are you sure you would like to approve?",
                                })
                              )
                            ) {
                              updateMember({
                                roundId,
                                memberId: member.id,
                                isApproved: true,
                              }).then(({ error }) => {
                                if (error) {
                                  console.error(error);
                                  toast.error(error.message);
                                }
                              });
                            }
                          }}
                        >
                          <FormattedMessage defaultMessage="Approve" />
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </>
  );
};

export default RequestToJoinTable;
