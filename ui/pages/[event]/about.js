export default ({ event }) => {
  if (!event.about) return null;
  return (
    <>
      <div className="shadow-md bg-white rounded-lg p-5 whitespace-pre-line">
        {event.about}
      </div>
    </>
  );
};
