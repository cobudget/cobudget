import Link from "next/link";
import Button from "components/Button";

const liStyle =
  "px-3 py-2 hover:bg-gray-200 hover:text-gray-900 text-gray-700 truncate";

const IndexPage = ({ currentUser }) => {
  const orgIds = currentUser?.orgMemberships?.map(
    (orgMember) => orgMember.organization.id
  );
  return (
    <div className="page">
      <div className="py-10">
        {false ? (
          <div className="flex justify-center items-center flex-col ">
            <h2 className="mb-4 text-lg font-medium">Your groups</h2>
            <ul className="max-w-xs bg-white rounded-md shadow divide-y-default divide-gray-200">
              {currentUser?.orgMemberships?.map((orgMember) => {
                return (
                  <li key={orgMember.id} className={liStyle}>
                    <Link href={`/${orgMember.organization.slug}`}>
                      <a>{orgMember.organization.name}</a>
                    </Link>
                  </li>
                );
              })}
              {currentUser?.collectionMemberships
                ?.filter(
                  (collMember) =>
                    !orgIds.includes(collMember.collection.organization?.id)
                )
                .map((collMember) => {
                  if (collMember.collection.organization)
                    return (
                      <li key={collMember.id} className={liStyle}>
                        <Link
                          href={`/${collMember.collection.organization.slug}`}
                        >
                          <a>{collMember.collection.organization.name}</a>
                        </Link>
                      </li>
                    );
                  return (
                    <li key={collMember.id} className={liStyle}>
                      <Link href={`/c/${collMember.collection.slug}`}>
                        <a>{collMember.collection.title}</a>
                      </Link>
                    </li>
                  );
                })}
              <li className={liStyle}>
                <Button size="large" nextJsLink href="/new-collection">
                  Create collection
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl mb-2 font-medium">Cobudget v2 beta</h1>
            <p>Stable version launching Jan 15th 2022</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;
