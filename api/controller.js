// I envision this file to be the Business Logic Layer. That's a fuzzy concept, but the goal is:
//  1. To keep business rules here (e.g. only an adming can approve X)
//  2. To push boilerplate outside, making focus on the ruels here easier
const createController = ({ Dream, Member }) => ({
  setDreamApproval: async (aDreamId, newApprovalStatus, issuingUser) => {
    const aDream = await Dream.findOne({_id:aDreamId});

    if (!aDream) 
      throw new Error( "Dream does not exist");
    if (!issuingUser) 
      throw new Error( "User needed to approve");
    if (typeof newApprovalStatus != "boolean") 
      throw new Error( newApprovalStatus + " is not a boolean.");

    const membership = await Member.findOne({
      userId: issuingUser.id,
      eventId: aDream.eventId,
    });

    if (!membership || (!membership.isAdmin && !membership.isGuide))
      throw new Error(
        'User must be admin or guide of the event to approve for granting'
      );

    aDream.approved = newApprovalStatus;
    return aDream.save();
  }
})

let controller = null

module.exports = models => {
  if (controller == null) controller = createController(models);
  return controller;
}
