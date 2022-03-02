// export const isMemberOfEvent = (currentMember, event) => {
//   if (!currentMember || !event) return false;
//   return currentMember.memberships.reduce((res, membership) => {
//     if (membership.event.slug === event.slug) return true;
//   }, false);
// };

export const isMemberOfBucket = (currentUser, bucket) => {
  if (!currentUser || !bucket || !currentUser.currentCollMember) return false;
  return bucket.cocreators.reduce((res, member) => {
    if (member.id === currentUser.currentCollMember.id) return true;
    return res;
  }, false);
};
