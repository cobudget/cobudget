import { RequiredActionAlias } from "keycloak-admin/lib/defs/requiredActionProviderRepresentation";
import initKcAdminClient from "../utils/initKcAdminClient";
import dotenv from "dotenv";
dotenv.config({ path: "api/.env" });

if (!process.env.KEYCLOAK_AUTH_SERVER) {
  throw ".env not loaded. Call from the top dir in the repo";
}

const TERMS = RequiredActionAlias.terms_and_conditions;

initKcAdminClient().then(async (kcAdminClient) => {
  // atm ~700 registered users, update the below max accordingly
  const users = await kcAdminClient.users.find({ max: 1000 });

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

  let i = 0;
  for (const user of usersWithoutRequired) {
    i++;
    if (i % 100 === 0) {
      console.log("At user", i, "out of", usersWithoutRequired.length);
    }

    console.log("username", user.username);
    await kcAdminClient.users.update(
      { id: user.id },
      {
        requiredActions: [...user.requiredActions, TERMS],
      }
    );

    // if you want to take it slow
    //if (i === 10) {
    //  console.log("done for now");
    //  return;
    //}
  }
});
