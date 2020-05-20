import Members from "components/admin-page/members";

export default ({ event }) => {
  return (
    <div className="rounded-lg shadow bg-white">
      <Members event={event} />
    </div>
  );
};
