import Link from "next/link";
import Button from "components/Button";

const LandingPage = () => {
  return (
    <div className="page">
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h1 className="text-6xl font-medium">
            Digital tools for participant-driven culture{" "}
            <Link href="/blivande">
              <a>Blivande</a>
            </Link>
          </h1>
          <p className="text-xl text-gray-800">
            Plato tools help you gather ideas, take decisions, map needs,
            budgets and areas of responsibility, and provide a socially focused
            digital meeting place for the participants.
          </p>
          <Link href="/organizations/create">
            <Button color="anthracit" size="large">
              Create a Community
            </Button>
          </Link>
          <p className="text-sm text-gray-800">
            Plato is in open beta. Organizations already use it, but we are
            still working on getting things just right. If you need Plato for a
            mission-critical project, please get in touch at{" "}
            <a
              className="text-black underline"
              href="mailto:info@platoproject.org"
            >
              info@platoproject.org
            </a>
            . Plato is currently free for small non-profits. If you need Plato
            for your business or large organization, let’s talk!
          </p>
        </div>
        <img className="" src="/frihamnstorget.jpeg" />
      </div>
    </div>
  );
};

const IndexPage = ({}) => {
  return <LandingPage />;
};

export default IndexPage;
