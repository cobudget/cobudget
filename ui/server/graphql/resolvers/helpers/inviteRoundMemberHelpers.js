// helpers/inviteRoundMembersHelper.js
import prisma from "../../../prisma";
import cuid from "cuid";
import interator from "utils/interator";
import { getIsGroupSubscriptionActive } from "../helpers/isGroupSubscriptionActive";

export async function inviteRoundMembersHelper({
  roundId,
  emailsString,
  currentUser,
  onMembersToInvite, // <= callback
}) {
  // 1. Fetch round and check existence
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { group: true },
  });
  if (!round) throw new Error("Round not found");

  // 2. Split incoming comma-separated list of emails
  const emails = emailsString.split(",").map((e) => e.trim().toLowerCase());
  if (emails.length > 10000) {
    throw new Error("You can only invite 10000 people at a time");
  }

  // 3. Fetch existing round members
  const roundMembers = await prisma.roundMember.findMany({
    where: { roundId: round.id },
    include: { user: true },
  });

  // 4. Handle subscription limits if needed
  let limit;
  const isFree = round.group?.slug === "c";
  const isSubscriptionActive = await getIsGroupSubscriptionActive({
    group: round.group,
  });

  if (!isFree && round.maxMembers && isSubscriptionActive) {
    limit = Math.max(
      parseInt(process.env.PAID_ROUND_MEMBERS_LIMIT, 10) || 0,
      round.maxMembers
    );
  } else if (round.maxMembers) {
    limit = round.maxMembers;
  } else if (isFree) {
    limit = parseInt(process.env.FREE_ROUND_MEMBERS_LIMIT, 10) || 100;
  } else {
    limit = parseInt(process.env.PAID_ROUND_MEMBERS_LIMIT, 10) || 1000;
  }

  if (roundMembers.length + emails.length > limit) {
    throw new Error(
      `Your round can have ${limit} members. ${
        isFree
          ? `Upgrade your round to increase limit to ${
              process.env.PAID_ROUND_MEMBERS_LIMIT || 1000
            }`
          : ""
      }`
    );
  }

  // 5. Build a lookup table for existing member emails
  const existingMemberEmails = {};
  roundMembers.forEach((m) => {
    existingMemberEmails[m.user.email] = m;
  });

  const joinedMembers = [];
  const alreadyMembers = [];
  const alreadyApprovedMembers = [];
  const newUsers = [];

  emails.forEach((email) => {
    const existing = existingMemberEmails[email];
    if (existing) {
      if (existing.isApproved && existing.hasJoined) {
        joinedMembers.push(existing);
      } else if (existing.isApproved) {
        alreadyApprovedMembers.push(existing);
      } else if (existing.hasJoined) {
        alreadyMembers.push(existing);
      }
    } else {
      newUsers.push(email);
    }
  });

  // 6. Approve members who joined but were not yet approved
  const dbWrites = [];
  if (alreadyMembers.length > 0) {
    dbWrites.push(
      prisma.roundMember.updateMany({
        data: { isApproved: true },
        where: { id: { in: alreadyMembers.map((m) => m.id) } },
      })
    );
  }

  // 7. Insert new users in small batches
  const BATCH_SIZE = 4;
  for (let i = 0; i < newUsers.length; i += BATCH_SIZE) {
    dbWrites.push(
      prisma.user.createMany({
        data: newUsers.slice(i, i + BATCH_SIZE).map((email) => ({ email })),
        skipDuplicates: true,
      })
    );
  }
  await Promise.all(dbWrites);

  // 8. Fetch newly created users
  const newlyAddedUsers = await prisma.user.findMany({
    where: { email: { in: newUsers } },
    select: { id: true, email: true },
  });

  // 9. Create 3 accounts for each newly added user
  const accountIds = interator(newlyAddedUsers.length * 3, () => cuid());
  await prisma.account.createMany({
    data: accountIds.map((id) => ({ id })),
  });

  // 10. Create roundMembers
  await prisma.roundMember.createMany({
    data: newlyAddedUsers.map((user) => ({
      isApproved: true,
      hasJoined: false,
      roundId,
      userId: user.id,
      statusAccountId: accountIds.pop(),
      incomingAccountId: accountIds.pop(),
      outgoingAccountId: accountIds.pop(),
    })),
  });

  // Everyone who needs an invite is either newly added or alreadyApproved
  const membersToInvite = newlyAddedUsers.concat(alreadyApprovedMembers);

  // 11. "Functional" part: Let the caller decide how to handle the invites
  // If `onMembersToInvite` was supplied, call it with (membersToInvite, round, currentUser)
  // The caller can do whatever they want—send custom email, regular email, or skip entirely
  if (membersToInvite.length && typeof onMembersToInvite === "function") {
    await onMembersToInvite(membersToInvite, round, currentUser);
  }

  // 12. Optionally return the newly created/approved round members

  console.log("membersToInvite", membersToInvite);
  return prisma.roundMember.findMany({
    where: {
      roundId,
      userId: { in: membersToInvite.map((u) => u.id) },
    },
  });
}
