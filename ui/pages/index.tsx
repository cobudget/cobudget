import Link from "next/link";
import Button from "components/Button";

const LandingPage = () => {
  return (
    <div className="page">
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h1 className="text-6xl font-medium">Cobudget v2</h1>
        </div>
      </div>
    </div>
  );
};

const IndexPage = ({}) => {
  return <LandingPage />;
};

export default IndexPage;
