export const isMemberOfEvent = (currentUser, event) => {
  if (!currentUser || !event) return false;
  return currentUser.memberships.reduce((res, membership) => {
    if (membership.event.slug === event.slug) return true;
  }, false);
};

export const isMemberOfDream = (currentUser, dream) => {
  if (!currentUser || !dream) return false;
  return dream.members.reduce((res, member) => {
    if (member.id === currentUser.id) return true;
  }, false);
};
