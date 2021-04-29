require("dotenv").config({ path: "api/.env" });
const initKcAdminClient = require("../utils/initKcAdminClient");

if (!process.env.KEYCLOAK_AUTH_SERVER) {
  throw ".env not loaded. Call from the top dir in the repo";
}

initKcAdminClient().then(async (kcAdminClient) => {
  //const userCount = await kcAdminClient.users.count();
  //console.log("number", userCount);
  // atm ~500 users, can check with the above snippet. update the below max accordingly
  const users = await kcAdminClient.users.find({ max: 1000 });

  console.log("users", users);
  console.log("len", users.length);
});
