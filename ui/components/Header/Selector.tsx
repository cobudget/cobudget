import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import classNames from "../../utils/classNames";
import { CheckIcon, SelectorIcon } from "../Icons";

function LinkItem(props) {
  let { href, children, active, selected, className, ...rest } = props;
  const linkStyle = classNames(
    "px-2 py-2 rounded flex justify-start items-center",
    active && "bg-gray-200",
    selected && "font-medium",
    className
  );

  return (
    <Link href={href}>
      <a {...rest} className={linkStyle}>
        {children}{" "}
        {selected && <CheckIcon className="h-5 w-5 flex-shrink-0 ml-auto" />}
      </a>
    </Link>
  );
}

export default function Selector({
  currentUser,
  currentOrg,
  collection,
  color,
  className,
}) {
  const orgIds = currentUser?.orgMemberships?.map(
    (orgMember) => orgMember.organization.id
  );
  const activeId = currentOrg ? currentOrg.id : collection?.id;
  return (
    <Menu as="div" className="inline-block">
      <div>
        <Menu.Button
          className={classNames(
            `group  flex items-center text-white space-x-2`,
            className
          )}
        >
          {!activeId && <span className="p-1 mx-1 opacity-50">Select</span>}
          <div
            className={`p-1 opacity-50 group-hover:opacity-100 group-hover:bg-${color}-dark rounded`}
          >
            <SelectorIcon className={`h-5 w-5`} />
          </div>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-10 left-14 w-72 mt-2 p-2 origin-top bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="pb-1 mb-1 border-b-default border-gray-200">
            {currentUser?.orgMemberships?.map((orgMember) => {
              return (
                <Menu.Item key={orgMember.id}>
                  {({ active }) => (
                    <LinkItem
                      href={`/${orgMember.organization.slug}`}
                      active={active}
                      selected={orgMember.organization.id === activeId}
                    >
                      {orgMember.organization.logo && (
                        <img
                          src={orgMember.organization.logo}
                          className="h-6 w-6 rounded flex-shrink-0 mr-2 object-cover"
                        />
                      )}
                      <p className="truncate">{orgMember.organization.name}</p>
                    </LinkItem>
                  )}
                </Menu.Item>
              );
            })}
            {currentUser?.collectionMemberships
              ?.filter((collMember, i, array) => {
                const orgId = collMember.collection.organization?.id;
                if (orgId) {
                  if (orgIds.includes(orgId)) return false;

                  const collectionFromOrgAlreadyInList = array
                    .slice(0, i)
                    .some(
                      (collMember) =>
                        collMember.collection.organization?.id === orgId
                    );
                  if (collectionFromOrgAlreadyInList) return false;
                }

                return true;
              })
              .map((collMember) => {
                if (collMember.collection.organization)
                  return (
                    <Menu.Item key={collMember.id}>
                      {({ active }) => (
                        <LinkItem
                          href={`/${collMember.collection.organization.slug}`}
                          active={active}
                          selected={
                            collMember.collection.organization.id === activeId
                          }
                        >
                          {collMember.collection.organization.logo && (
                            <img
                              src={collMember.collection.organization.logo}
                              className="h-6 w-6 rounded flex-shrink-0 mr-2 object-cover"
                            />
                          )}
                          <p className="truncate">
                            {collMember.collection.organization.name}
                          </p>
                        </LinkItem>
                      )}
                    </Menu.Item>
                  );
                return (
                  <Menu.Item key={collMember.id}>
                    {({ active }) => (
                      <LinkItem
                        href={`/c/${collMember.collection.slug}`}
                        active={active}
                        selected={collMember.collection.id === activeId}
                      >
                        <span className="truncate">
                          {collMember.collection.title}
                        </span>
                      </LinkItem>
                    )}
                  </Menu.Item>
                );
              })}
          </div>
          <Menu.Item>
            {({ active }) => (
              <LinkItem
                href={`/new-round`}
                active={active}
                className="text-gray-500 hover:text-gray-900"
              >
                New Round
              </LinkItem>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
