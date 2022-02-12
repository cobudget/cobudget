import { useState } from "react";
import { useMutation, gql } from "urql";
import ProfileDropdown from "components/ProfileDropdown";
import Avatar from "components/Avatar";
import { modals } from "components/Modal/index";
import OrganizationAndEventHeader from "./OrganizationAndEventHeader";
import NavItem from "./NavItem";
import toast from "react-hot-toast";

const css = {
  mobileProfileItem:
    "mx-1 px-3 py-2 block text-gray-800 text-left rounded hover:bg-gray-200 focus:outline-none focus:ring",
};

const JOIN_ORG_MUTATION = gql`
  mutation JoinOrg($orgId: ID!) {
    joinOrg(orgId: $orgId) {
      id
      bio
      isAdmin
      discourseUsername
      hasDiscourseApiKey
      user {
        id
        name
        username
        email
      }
      collectionMemberships {
        id
        isAdmin
        isModerator
        isApproved
        collection {
          id
          title
          slug
        }
      }
      organization {
        id
        slug
      }
    }
  }
`;

const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($collectionId: ID!) {
    acceptInvitation(collectionId: $collectionId) {
      id
      isAdmin
      isModerator
      isApproved
      hasJoined
      balance
      collection {
        id
        title
        slug
        organization {
          id
          slug
        }
      }
    }
  }
`;

const JOIN_COLLECTION_MUTATION = gql`
  mutation JoinCollection($collectionId: ID!) {
    joinCollection(collectionId: $collectionId) {
      id
      isAdmin
      isModerator
      isApproved
      balance
      collection {
        id
        title
        slug
        organization {
          id
          slug
        }
      }
    }
  }
`;

const Header = ({ collection, currentUser, currentOrg, openModal, router }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const [, joinOrg] = useMutation(JOIN_ORG_MUTATION);
  const [, acceptInvitation] = useMutation(ACCEPT_INVITATION);

  const [, joinCollection] = useMutation(JOIN_COLLECTION_MUTATION);
  const color = collection?.color ?? "anthracit";

  return (
    <header className={`bg-${color} shadow-md w-full`}>
      <div className=" sm:flex sm:justify-between sm:items-center sm:py-2 md:px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between py-2 px-2 sm:p-0 relative">
          <OrganizationAndEventHeader
            currentOrg={currentOrg}
            collection={collection}
            color={color}
            currentUser={currentUser}
            router={router}
          />

          <div className="sm:hidden">
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className={
                `p-1 my-1 block focus:outline-none rounded opacity-75 ` +
                `text-white hover:bg-${color}-dark focus:bg-${color}-dark focus:opacity-100`
              }
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path
                    fillRule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                  />
                ) : (
                  <path d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <nav
          className={`${
            isMenuOpen ? "block" : "hidden"
          } min-w-full sm:m-0 sm:min-w-0 sm:block bg-${color} sm:bg-transparent`}
        >
          <div className="py-2 sm:flex sm:p-0 sm:items-center">
            {currentUser ? (
              <>
                {currentUser.currentCollMember?.hasJoined === false ? (
                  <NavItem
                    primary
                    eventColor={color}
                    onClick={() => {
                      acceptInvitation({ collectionId: collection?.id }).then(
                        ({ data, error }) => {
                          console.log({ data });
                          if (error) {
                            toast.error(error.message);
                          } else {
                            toast.success("Invitation Accepted");
                          }
                        }
                      );
                    }}
                  >
                    Accept Invitation
                  </NavItem>
                ) : null}
                {!currentUser.currentCollMember &&
                  collection &&
                  (collection.registrationPolicy !== "INVITE_ONLY" ||
                    currentUser.currentOrgMember?.isAdmin) && (
                    <NavItem
                      primary
                      eventColor={color}
                      onClick={() =>
                        joinCollection({ collectionId: collection?.id }).then(
                          ({ data, error }) => {
                            console.log({ data });
                            if (error) {
                              toast.error(error.message);
                            } else {
                              toast.success(
                                collection.registrationPolicy ===
                                  "REQUEST_TO_JOIN"
                                  ? "Request sent!"
                                  : "You joined this collection!"
                              );
                            }
                          }
                        )
                      }
                    >
                      {collection.registrationPolicy === "REQUEST_TO_JOIN"
                        ? "Request to join"
                        : "Join collection"}
                    </NavItem>
                  )}
                {!currentUser.currentOrgMember && !collection && currentOrg && (
                  <NavItem
                    primary
                    eventColor={color}
                    onClick={() => joinOrg({ orgId: currentOrg.id })}
                  >
                    Join org
                  </NavItem>
                )}

                <div className="hidden sm:block sm:ml-4">
                  <ProfileDropdown
                    currentUser={currentUser}
                    openModal={openModal}
                  />
                </div>
                <div data-cy="user-is-logged-in" />
              </>
            ) : (
              <>
                <NavItem href={`/login`} eventColor={color}>
                  Log in
                </NavItem>
                <NavItem href={`/signup`} eventColor={color} primary>
                  Sign up
                </NavItem>
              </>
            )}
          </div>

          {/* Mobile view of profile dropdown contents above (i.e. all profile dropdown items are declared twice!)*/}
          {currentUser && (
            <div className="pt-4 pb-1 sm:hidden bg-white mb-4 border-gray-300">
              <div className="flex items-center px-3">
                <Avatar user={currentUser} />
                <div className="ml-4">
                  <span className="font-semibold text-gray-600">
                    {currentUser.name}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex flex-col items-stretch">
                <button
                  onClick={() => {
                    openModal(modals.EDIT_PROFILE);
                  }}
                  className={css.mobileProfileItem}
                >
                  Edit profile
                </button>
                <a href={"/api/auth/logout"} className={css.mobileProfileItem}>
                  Sign out
                </a>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
