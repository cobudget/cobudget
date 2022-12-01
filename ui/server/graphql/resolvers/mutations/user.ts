import prisma from "../../../prisma";
import { combineResolvers } from "graphql-resolvers";
import validateUsername from "utils/validateUsername";

export const updateProfile = async (
  _,
  { name, username, mailUpdates },
  { user }
) => {
  if (!user) throw new Error("You need to be logged in..");

  if (!validateUsername(username)) throw new Error("Username is not valid");

  // check case insensitive uniquness of username
  const existingUser = await prisma.user.findFirst({
    where: { username: { mode: "insensitive", equals: username } },
  });

  if (existingUser) throw new Error("Username is already taken");

  return prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      username,
      mailUpdates,
    },
  });
};

export const updateBio = async (_, { roundId, bio }, { user }) => {
  if (!user) throw new Error("You need to be logged in..");

  return prisma.roundMember.update({
    where: { userId_roundId: { userId: user.id, roundId } },
    data: {
      bio,
    },
  });
};

export const setEmailSetting = async (
  parent,
  { settingKey, value },
  { user }
) => {
  if (!user) throw "You need to be logged in";

  await prisma.emailSettings.upsert({
    where: { userId: user.id },
    create: { userId: user.id, [settingKey]: value },
    update: { [settingKey]: value },
  });

  return prisma.user.findUnique({ where: { id: user.id } });
};

export const acceptTerms = async (parent, args, { user }) => {
  if (!user) throw new Error("You need to be logged in");
  return prisma.user.update({
    where: { id: user.id },
    data: { acceptedTermsAt: new Date() },
  });
};
