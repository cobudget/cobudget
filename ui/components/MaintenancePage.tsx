import { FormattedMessage } from "react-intl";

interface MaintenancePageProps {
  groupName?: string;
}

const MaintenancePage = ({ groupName }: MaintenancePageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            <FormattedMessage defaultMessage="Under Maintenance" />
          </h1>
          <p className="text-gray-600 mb-6">
            {groupName ? (
              <FormattedMessage
                defaultMessage="{groupName} is currently undergoing maintenance. Please check back later."
                values={{ groupName }}
              />
            ) : (
              <FormattedMessage defaultMessage="This site is currently undergoing maintenance. Please check back later." />
            )}
          </p>
          <div className="text-sm text-gray-500">
            <FormattedMessage defaultMessage="We apologize for any inconvenience." />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
