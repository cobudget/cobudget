// export const isMemberOfRound = (currentMember, round) => {
//   if (!currentMember || !round) return false;
//   return currentMember.memberships.reduce((res, membership) => {
//     if (membership.round.slug === round.slug) return true;
//   }, false);
// };

export const isMemberOfBucket = (currentUser, bucket) => {
  if (!currentUser || !bucket || !currentUser.currentCollMember) return false;
  return bucket.cocreators.reduce((res, member) => {
    if (member.id === currentUser.currentCollMember.id) return true;
    return res;
  }, false);
};
