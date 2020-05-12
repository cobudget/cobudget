// export const isMemberOfEvent = (currentMember, event) => {
//   if (!currentMember || !event) return false;
//   return currentMember.memberships.reduce((res, membership) => {
//     if (membership.event.slug === event.slug) return true;
//   }, false);
// };

export const isMemberOfDream = (currentUser, dream) => {
  if (!currentUser || !dream) return false;

  return dream.members.reduce((res, member) => {
    if (member.user.id === currentUser.id) return true;
  }, false);
};
