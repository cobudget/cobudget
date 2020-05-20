import { Box } from "@material-ui/core";
import Card from "../../components/styled/Card";
import EditOrCreateDreamForm from "../../components/EditOrCreateDreamForm";

export default ({ event }) => {
  if (!event) return null;

  return (
    <>
      <div className="rounded-lg shadow bg-white p-5">
        <h1 className="text-xl mb-3 text-gray-800">Create dream</h1>

        <EditOrCreateDreamForm event={event} />
      </div>
    </>
  );
};
