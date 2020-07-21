const fetch = require("node-fetch");
require('dotenv').config();

if(!process.env.TEST_DREAM) 
  console.log("Please perform the first-time setup in test.sh.");
if(!process.env.TEST_EVENT) 
  console.log("Please perform the first-time setup in test.sh.");

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

async function check_query(query, expected) {
  await do_query(query).then(res => {
    if (JSON.stringify(res) === expected) {
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
  grantValue: 10
){id, grantingOpens, grantingCloses}}`);
    let { resEventId, grantingOpens, grantingCloses } = res.data.updateGrantingSettings;
    if (!resEventId === eventId) throw new Error("Not same event returned");

    res = await do_query(`mutation { editDream(
  dreamId:"${dreamId}",
	budgetItems:[
    {description:"test", min:10,type:EXPENSE}
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
  do_query("{ currentUser {id} }");
  check_query(
    `mutation {approveForGranting(dreamId:"${subjects.dreamId}", approved:true){approved}}`,
    '{"data":{"approveForGranting":{"approved":true}}}'
  );
  check_query(
    `mutation {approveForGranting(dreamId:"${subjects.dreamId}", approved:false){approved}}`,
    '{"data":{"approveForGranting":{"approved":false}}}'
  );
  check_query(
    `mutation {approveForGranting(dreamId:"${subjects.dreamId}", approved:true){approved}}`,
    '{"data":{"approveForGranting":{"approved":true}}}'
  );

})().catch(e => console.log(e));

