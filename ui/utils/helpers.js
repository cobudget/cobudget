export const isMemberOfEvent = (currentUser, event) => {
  if (!currentUser || !event) return false;
  return currentUser.memberships.reduce((res, membership) => {
    if (membership.event.slug === event.slug) return true;
  }, false);
};
