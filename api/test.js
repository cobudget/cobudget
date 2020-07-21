const fetch = require("node-fetch");
require('dotenv').config();

async function do_query(query) {
  const json = {query};
  const result = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(json)
  });
  return await result.json();
}

async function check_query(query, condition) {
  if(typeof condition === "string") {
    let old = condition;
    condition = res => JSON.stringify(res) === old;
  }

  await do_query(query).then(res => {
    if (condition(res)) {
      console.log("OK");
    } else {
      console.log("Error: ")
      console.log(res);
    }
  }).catch(err => {
      console.log("Error: ")
      console.log(err);
  });
}

(async function main() {
  let dreamBudget = 10;
  subjects = {}
  { // First, setup
    let res = await do_query("{ currentUser {id} }");
    let { data: { currentUser: { id: userId } } } = res;
    if (!userId) throw new Error("Error, no user to test with.");

    res = await do_query(`mutation {createEvent(slug:"test${Date.now()}", title:"test", currency:"EUR", registrationPolicy:OPEN){id}}`);
    let { data: { createEvent: {id: eventId} } } = res;
    if (!eventId) throw new Error("Failed to setup event");

    res = await do_query(`mutation {createDream(eventId:"${eventId}",title:"test"){id}}`);
    let { data: { createDream : { id: dreamId } } } = res;
    if (!dreamId) throw new Error("Failed to setup dream");

    res = await do_query(`mutation {updateGrantingSettings(
  eventId:"${eventId}",
  grantingOpens: "2020-01-02",
  grantingCloses: "2022-01-01",
  dreamCreationCloses: "2020-01-01",
  totalBudget:1000,
  grantValue: 1
){id, grantingOpens, grantingCloses}}`);
    let { resEventId, grantingOpens, grantingCloses } = res.data.updateGrantingSettings;
    if (!resEventId === eventId) throw new Error("Not same event returned");

    res = await do_query(`mutation { editDream(
  dreamId:"${dreamId}",
	budgetItems:[
    {description:"test", min:${dreamBudget},type:EXPENSE}
  ]
){id,maxGoal,maxGoalGrants,budgetItems{description,min,max}}}`);
    let {description, min, max} = res.data.editDream.budgetItems[0];
    if(min != 10) throw new Error("Min not set right");

    res = await do_query(`mutation {approveForGranting(dreamId:"${dreamId}", approved:true){approved}}`);
    let {approved} = res.data.approveForGranting;
    if(approved !== true) throw new Error("Could not approve for granting.");

    subjects.dreamId = dreamId;
    subjects.eventId = eventId;
  }


  // Here follow the tests
  await check_query(
    `mutation {approveForGranting(dreamId:"${subjects.dreamId}", approved:true){approved}}`,
    '{"data":{"approveForGranting":{"approved":true}}}'
  );

  await check_query(
    `mutation {approveForGranting(dreamId:"${subjects.dreamId}", approved:false){approved}}`,
    '{"data":{"approveForGranting":{"approved":false}}}'
  );

  await check_query(
    `mutation {approveForGranting(dreamId:"${subjects.dreamId}", approved:true){approved}}`,
    '{"data":{"approveForGranting":{"approved":true}}}'
  );

  await check_query(`mutation { giveGrant(eventId:"${subjects.eventId}", dreamId: "${subjects.dreamId}", value:${dreamBudget+1}){value}}`,
    res => !!res.errors
  );

  await check_query(`mutation { giveGrant(eventId:"${subjects.eventId}", dreamId: "${subjects.dreamId}", value:${dreamBudget}){value}}`,
    '{"data":{"giveGrant":{"value":10}}}'
  );

  await check_query(`mutation { giveGrant(eventId:"${subjects.eventId}", dreamId: "${subjects.dreamId}", value:1){value}}`,
    res => !!res.errors
  );

})().catch(e => console.log(e));

