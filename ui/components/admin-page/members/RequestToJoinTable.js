import {
  Box,
  Table,
  Button,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@material-ui/core";

export default ({ requestsToJoin }) => {
  return (
    <>
      {requestsToJoin.length > 0 ? (
        <Box m="0 0 20px">
          <Box p={2}>
            <h2>{requestsToJoin.length} requests to join</h2>
          </Box>
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requestsToJoin.map(member => (
                  <TableRow key={member.email}>
                    <TableCell component="th" scope="row">
                      {member.name}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell align="right" padding="none">
                      <Box p="0 15px" display="flex" justifyContent="flex-end">
                        <Box m="0 8px 0">
                          <Button
                            color="secondary"
                            size="small"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you would like to DELETE this membership request?"
                                )
                              )
                                deleteMember({
                                  variables: { memberId: member.id }
                                });
                            }}
                          >
                            Delete
                          </Button>
                        </Box>

                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => {
                            if (
                              confirm("Are you sure you would like to approve?")
                            )
                              updateMember({
                                variables: {
                                  memberId: member.id,
                                  isApproved: true
                                }
                              });
                          }}
                        >
                          Approve
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : null}
    </>
  );
};
