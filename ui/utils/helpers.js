// export const isMemberOfEvent = (currentMember, event) => {
//   if (!currentMember || !event) return false;
//   return currentMember.memberships.reduce((res, membership) => {
//     if (membership.event.slug === event.slug) return true;
//   }, false);
// };

export const isMemberOfDream = (currentOrgMember, dream) => {
  if (!currentOrgMember || !dream || !currentOrgMember.currentEventMembership)
    return false;
  return dream.cocreators.reduce((res, member) => {
    if (member.id === currentOrgMember.currentEventMembership.id) return true;
    return res;
  }, false);
};
