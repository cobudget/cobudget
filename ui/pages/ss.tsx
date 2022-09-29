import React, { useMemo, useState, useRef } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { gql, useQuery } from "urql";
import HappySpinner from "components/HappySpinner";
import LoadMore from "components/LoadMore";
import dayjs from "dayjs";
import { toMS } from "utils/date";

const GET_SUPER_ADMIN_SESSIONS = gql`
  query GetSuperAdminSessions($limit: Int!, $offset: Int!) {
    getSuperAdminSessions(limit: $limit, offset: $offset) {
      moreExist
      sessions {
        id
        start
        end
        duration
        user {
          username
        }
      }
    }
  }
`;

function SS() {
  const limit = 15;
  const [offset, setOffset] = useState(0);
  const [{ data, fetching }] = useQuery({
    query: GET_SUPER_ADMIN_SESSIONS,
    variables: { offset, limit },
  });
  const moreExist = data?.getSuperAdminSessions?.moreExist;
  const offsetRef = useRef(0);
  const sessionsRef = useRef([]);

  const sessions = useMemo(() => {
    if (data?.getSuperAdminSessions.sessions) {
      offsetRef.current = offset;
      sessionsRef.current = sessionsRef.current.concat(
        data?.getSuperAdminSessions.sessions || []
      );
      return sessionsRef.current;
    }
  }, [data?.getSuperAdminSessions.sessions, offset]);

  if (fetching && (sessions?.length === 0 || !sessions))
    return <HappySpinner />;

  return (
    <div className="page">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Admin</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions?.map((ss) => {
                const end = ss.end || ss.start + ss.duration * 60000;
                return (
                  <TableRow key={ss.id}>
                    <TableCell>@{ss.user.username}</TableCell>
                    <TableCell>
                      {dayjs(ss.start).format("MMM DD YYYY hh:mm a")}
                    </TableCell>
                    <TableCell>
                      {dayjs(end).format("MMM DD YYYY hh:mm a")}
                    </TableCell>
                    <TableCell>
                      {toMS(end - ss.start)} / {ss.duration}:00
                    </TableCell>
                  </TableRow>
                );
              })}
              {moreExist && (
                <LoadMore
                  moreExist={moreExist}
                  loading={fetching}
                  onClick={() => setOffset(offset + limit)}
                />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default SS;
