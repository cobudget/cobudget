export default function PageHero({ children }) {
  return (
    <div className="space-x-2 bg-white border-b border-b-default">
      <div className="max-w-screen-xl mx-auto flex pt-14 pb-20 px-2 md:px-4 justify-between">
        {children}
      </div>
    </div>
  );
}
