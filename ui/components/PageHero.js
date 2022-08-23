export default function PageHero({ children, className = "" }) {
  return (
    <div className={"bg-white border-b border-b-default " + className}>
      <div className="max-w-screen-xl mx-auto py-14 px-2 md:px-4">
        {children}
      </div>
    </div>
  );
}
