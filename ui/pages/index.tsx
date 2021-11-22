import Link from "next/link";
import Button from "components/Button";

const IndexPage = ({ currentUser }) => {
  return (
    <div className="page">
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h1 className="text-6xl font-medium">Testing cobudget v2</h1>
          <Button size="large" nextJsLink href="/create">
            Create community
          </Button>
          <ul>
            {currentUser?.orgMemberships && <p>Your communities: </p>}
            {currentUser?.orgMemberships.map((orgMember) => {
              return (
                <li key={orgMember.id}>
                  <Link href={`/${orgMember.organization.slug}`}>
                    <a className="underline">{orgMember.organization.name}</a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
