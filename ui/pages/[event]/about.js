import About from "components/About";

export default ({ event }) => {
  if (!event) return null;
  return (
    <div className="max-w-screen-md flex-1">
      <About event={event} />
    </div>
  );
};
