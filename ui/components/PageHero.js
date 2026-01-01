export default function PageHero({ children, className = "" }) {
  return (
    <div className={"bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 " + className}>
      <div className="max-w-screen-xl mx-auto py-10 md:py-14 px-4 md:px-6">
        {children}
      </div>
    </div>
  );
}
