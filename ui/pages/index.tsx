import Link from "next/link";
import Button from "components/Button";

const liStyle =
  "px-3 py-2 hover:bg-gray-200 hover:text-gray-900 text-gray-700 truncate";

const IndexPage = ({ currentUser }) => {
  const orgIds = currentUser?.orgMemberships?.map(
    (orgMember) => orgMember.group.id
  );
  return (
    <div className="page w-full">
      <div className="py-10">
        {false ? (
          <div className="flex justify-center items-center flex-col ">
            <h2 className="mb-4 text-lg font-medium">Your groups</h2>
            <ul className="max-w-xs bg-white rounded-md shadow divide-y-default divide-gray-200">
              {currentUser?.orgMemberships?.map((orgMember) => {
                return (
                  <li key={orgMember.id} className={liStyle}>
                    <Link href={`/${orgMember.group.slug}`}>
                      <a>{orgMember.group.name}</a>
                    </Link>
                  </li>
                );
              })}
              {currentUser?.roundMemberships
                ?.filter(
                  (collMember) =>
                    !orgIds.includes(collMember.round.group?.id)
                )
                .map((collMember) => {
                  if (collMember.round.group)
                    return (
                      <li key={collMember.id} className={liStyle}>
                        <Link
                          href={`/${collMember.round.group.slug}`}
                        >
                          <a>{collMember.round.group.name}</a>
                        </Link>
                      </li>
                    );
                  return (
                    <li key={collMember.id} className={liStyle}>
                      <Link href={`/c/${collMember.round.slug}`}>
                        <a>{collMember.round.title}</a>
                      </Link>
                    </li>
                  );
                })}
              <li className={liStyle}>
                <Button size="large" nextJsLink href="/new-round">
                  Create round
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
