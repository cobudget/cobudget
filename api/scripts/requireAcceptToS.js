const {
  RequiredActionAlias,
} = require("keycloak-admin/lib/defs/requiredActionProviderRepresentation");
require("dotenv").config({ path: "api/.env" });
const initKcAdminClient = require("../utils/initKcAdminClient");

if (!process.env.KEYCLOAK_AUTH_SERVER) {
  throw ".env not loaded. Call from the top dir in the repo";
}

const TERMS = RequiredActionAlias.terms_and_conditions;

initKcAdminClient().then(async (kcAdminClient) => {
  //const userCount = await kcAdminClient.users.count();
  //console.log("number", userCount);
  // atm ~500 users, can check with the above snippet. update the below max accordingly
  const users = await kcAdminClient.users.find({ max: 1000 });

  //console.log("users", users);
  //console.log("user 1:", users[20]);
  console.log("Total users:", users.length);

  // users who haven't accepted the terms yet
  // this is a unix timestamp (as a string inside an array) so if we want them to accept a newer version
  // we can check that
  const usersWithoutAccept = users.filter((user) => !user.attributes?.[TERMS]);

  console.log("users without tos accepted", usersWithoutAccept.length);

  const usersWithoutRequired = usersWithoutAccept.filter(
    (user) => !user.requiredActions.includes(TERMS)
  );

  console.log(
    "users who we're not currently asking (requiring) to accept the tos",
    usersWithoutRequired.length
  );

  //const userId = currentUser.id;
  //await kcAdminClient.users.update(
  //  { id: userId },
  //  {
  //    firstName: "william",
  //    lastName: "chang",
  //    requiredActions: [RequiredActionAlias.UPDATE_PASSWORD],
  //    emailVerified: true,
  //  }
  //);

  //const me = await kcAdminClient.users.findOne({
  //  id: "32f170b5-afdf-4b1a-bdc4-c694a467e0d1",
  //});
  //console.log("me", me);
});
