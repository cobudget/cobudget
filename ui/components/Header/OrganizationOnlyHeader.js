import Link from "next/link";

export default ({ currentOrg }) => (
  <Link href="/">
    <a className="flex">
      {currentOrg?.logo && (
        <img
          className="h-7 w-7 block rounded overflow-hidden mr-4"
          src={currentOrg.logo}
        />
      )}
      <h1 className="text-lg font-medium text-gray-900 ">
        {currentOrg?.name ?? "Plato"}
      </h1>
    </a>
  </Link>
);
