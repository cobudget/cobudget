import { Divider, List } from "@material-ui/core";
import HappySpinner from "components/HappySpinner";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useQuery } from "urql";
import SettingsListItem from "../Granting/SettingsListItem";

const GET_ROUND_INTEGRATIONS = gql`
  query GetRoundIntegrations($roundSlug: String!) {
    round(roundSlug: $roundSlug) {
      color
      ocCollective {
          id
          name
          slug
      }
    }
  }
`;

function Integrations() {
  const router = useRouter();
  const [{ data, error, fetching }] = useQuery({
    query: GET_ROUND_INTEGRATIONS,
    variables: { roundSlug: router.query.round },
  });
  const [openModal, setOpenModal] = useState("");
  const intl = useIntl();

  const round = data?.round;

  if (fetching) {
    return <HappySpinner />;
  }

  if (round) {
    return (
      <div className="-mb-6">
        <h2 className="text-2xl font-semibold mb-3 px-6">
          <FormattedMessage defaultMessage="Integrations" />
        </h2>
        <div className="border-t">
          <List>
            <SettingsListItem
              primary={intl.formatMessage({
                defaultMessage: "Connect round to Open Collective",
              })}
              secondary={"ABC"}
              isSet={false}
              canEdit={true}
              openModal={() => setOpenModal("SET_CURRENCY")}
              roundColor={round.color}
            />
          </List>
          <Divider />
        </div>
      </div>
    );
  }

  return null;
}

export default Integrations;
