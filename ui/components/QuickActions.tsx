import { useMutation, gql } from "urql";
import { FormattedMessage } from "react-intl";
import Button from "components/Button";

const QUICK_ACTIONS_MUTATION = gql`
  mutation QuickActions(
    $roundId: ID!
    $allocationPaused: Boolean
    $withdrawalEnabled: Boolean
  ) {
    updateGrantingSettings(
      roundId: $roundId
      allocationPaused: $allocationPaused
      withdrawalEnabled: $withdrawalEnabled
    ) {
      id
      allocationPaused
      withdrawalEnabled
    }
  }
`;

const ACTIONS = [
  {
    key: "open",
    label: "Open allocation",
    description: "Allocation open, no withdrawals",
    allocationPaused: false,
    withdrawalEnabled: false,
  },
  {
    key: "readout",
    label: "Pause for read-out",
    description: "Allocation frozen, read-out in progress",
    allocationPaused: true,
    withdrawalEnabled: false,
  },
  {
    key: "realloc",
    label: "Open re-allocation",
    description: "Allow participants to withdraw and reallocate",
    allocationPaused: false,
    withdrawalEnabled: true,
  },
];

const isActive = (action, round) =>
  round.allocationPaused === action.allocationPaused &&
  round.withdrawalEnabled === action.withdrawalEnabled;

const QuickActions = ({ round }) => {
  const [{ fetching }, updateGranting] = useMutation(QUICK_ACTIONS_MUTATION);

  const apply = (action) => {
    updateGranting({
      roundId: round.id,
      allocationPaused: action.allocationPaused,
      withdrawalEnabled: action.withdrawalEnabled,
    });
  };

  return (
    <div className="p-3 mb-5 bg-gray-50 shadow-md rounded-md">
      <p className="font-bold my-0.5">
        <FormattedMessage defaultMessage="Quick actions" />
      </p>
      <div className="mt-2 space-y-2">
        {ACTIONS.map((action) => {
          const active = isActive(action, round);
          return (
            <div key={action.key}>
              <Button
                size="small"
                fullWidth
                color={round.color}
                variant={active ? "primary" : "secondary"}
                disabled={active || fetching}
                onClick={() => apply(action)}
              >
                {action.label}
              </Button>
              <p className="text-xs text-gray-500 mt-0.5 ml-1">
                {action.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
