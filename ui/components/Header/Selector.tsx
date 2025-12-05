import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import classNames from "../../utils/classNames";
import { CheckIcon, SelectorIcon } from "../Icons";
import { FormattedMessage } from "react-intl";

function LinkItem(props) {
  const { href, children, active, selected, className, ...rest } = props;
  const linkStyle = classNames(
    "px-2 py-2 rounded flex justify-start items-center",
    active && "bg-gray-200",
    selected && "font-medium",
    className
  );

  return (
    <Link href={href} {...rest} className={linkStyle}>
      {children}{" "}
      {selected && <CheckIcon className="h-5 w-5 flex-shrink-0 ml-auto" />}
    </Link>
  );
}

export default function Selector({
  currentUser,
  currentGroup,
  round,
  color,
  className,
}) {
  const groupIds = currentUser?.groupMemberships?.map(
    (groupMember) => groupMember.group.id
  );
  const activeId = currentGroup ? currentGroup.id : round?.id;
  return (
    <Menu as="div" className="inline-block">
      <div>
        <Menu.Button
          className={classNames(
            `group  flex items-center text-white space-x-2`,
            className
          )}
        >
          {!activeId && (
            <span className="p-1 mx-1 opacity-50">
              <FormattedMessage defaultMessage="Select" />
            </span>
          )}
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
        <Menu.Items className="absolute z-10  w-72 mt-2 p-2 origin-top bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="pb-1 mb-1 border-b-default border-gray-200">
            {currentUser?.groupMemberships?.map((groupMember) => {
              return (
                <Menu.Item key={groupMember.id}>
                  {({ active }) => (
                    <LinkItem
                      href={`/${groupMember.group.slug}`}
                      active={active}
                      selected={groupMember.group.id === activeId}
                    >
                      {groupMember.group.logo && (
                        <img
                          src={groupMember.group.logo}
                          className="h-6 w-6 rounded flex-shrink-0 mr-2 object-cover"
                        />
                      )}
                      <span className="truncate">{groupMember.group.name}</span>
                    </LinkItem>
                  )}
                </Menu.Item>
              );
            })}
            {currentUser?.roundMemberships
              ?.filter((roundMember, i, array) => {
                const groupId = roundMember.round.group?.id;
                if (groupId) {
                  if (groupIds.includes(groupId)) return false;

                  const roundFromGroupAlreadyInList = array
                    .slice(0, i)
                    .some(
                      (roundMember) => roundMember.round.group?.id === groupId
                    );
                  if (roundFromGroupAlreadyInList) return false;
                }

                return true;
              })
              .map((roundMember) => {
                /*
                if (roundMember.round.group)
                  return (
                    <Menu.Item key={roundMember.id}>
                      {({ active }) => (
                        <LinkItem
                          href={`/${roundMember.round.group.slug}`}
                          active={active}
                          selected={roundMember.round.group.id === activeId}
                        >
                          {roundMember.round.group.logo && (
                            <img
                              src={roundMember.round.group.logo}
                              className="h-6 w-6 rounded flex-shrink-0 mr-2 object-cover"
                            />
                          )}
                          <span className="truncate">
                            {roundMember.round.group.name}
                          </span>
                        </LinkItem>
                      )}
                    </Menu.Item>
                  );
                */
                return (
                  <Menu.Item key={roundMember.id}>
                    {({ active }) => (
                      <LinkItem
                        href={`/${roundMember.round?.group?.slug || "c"}/${
                          roundMember.round.slug
                        }`}
                        active={active}
                        selected={roundMember.round.id === activeId}
                      >
                        <span className="truncate">
                          {roundMember.round.title}
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
                <FormattedMessage defaultMessage="New Round" />
              </LinkItem>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
