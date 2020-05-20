import { Box } from "@material-ui/core";
import Card from "../../components/styled/Card";
import EditOrCreateDreamForm from "../../components/EditOrCreateDreamForm";

export default ({ event }) => {
  if (!event) return null;

  return (
    <>
      <h1 className="text-2xl mb-3 text-gray-800">Create dream</h1>

      <div className="rounded-lg shadow bg-white p-5">
        <EditOrCreateDreamForm event={event} />
      </div>
    </>
  );
};
