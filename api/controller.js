const mongoose = require('mongoose');
// I envision this file to be the Business Logic Layer. That's a fuzzy concept, but the goal is:
//  1. To keep business rules here (e.g. only an adming can approve X)
//  2. To push boilerplate outside, making focus on the ruels here easier
const createController = ({ Dream, Member, Event, Grant }) => ({
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
  },
  minGoalGrants: async (aDream) => {
      const { grantValue } = await Event.findOne({ _id: aDream.eventId });
      if (aDream.minGoal === null || !grantValue) {
        return null;
      }
      return Math.ceil(aDream.minGoal / grantValue);
  },
  maxGoalGrants: async (aDream) => {
    const { grantValue } = await Event.findOne({ _id: aDream.eventId });
    if (aDream.maxGoal === null || !grantValue) {
      return null;
    }
    return Math.ceil(aDream.maxGoal / grantValue);
  },
  currentNumberOfGrants: async (aDream) => {
      const [
        { grantsForDream } = { grantsForDream: 0 },
      ] = await Grant.aggregate([
        {
          $match: {
            dreamId: mongoose.Types.ObjectId(aDream.id),
            reclaimed: false,
          },
        },
        { $group: { _id: null, grantsForDream: { $sum: '$value' } } },
      ]);
      return grantsForDream;
  },
  hasRoomInBudgetForGrantOfSize: async (dream, grantSize) => {
    const grantsForDream = await controller.currentNumberOfGrants(dream);
    const maxGoalGrants = await controller.maxGoalGrants(dream);

    return (grantsForDream + grantSize <= maxGoalGrants)
  },
  numberOfGivenGrants: async (aMember) => {
    const [
      { grantsFromUser } = { grantsFromUser: 0 },
    ] = await Grant.aggregate([
      {
        $match: {
          memberId: mongoose.Types.ObjectId(aMember.id),
          type: 'USER',
        },
      },
      { $group: { _id: null, grantsFromUser: { $sum: '$value' } } },
    ]);
    return grantsFromUser;
  },
  canGiveNumberOfGrantsMore: async (aMember, anEvent, numGrants) => {
    let grantsFromUser = await controller.numberOfGivenGrants(aMember);
    return (grantsFromUser + numGrants <= anEvent.grantsPerMember)
  },
  eventBudgetWontBeExceededBy: async(anEvent, grantAmount) => {
    const [
      { grantsFromEverybody } = { grantsFromEverybody: 0 },
    ] = await Grant.aggregate([
      {
        $match: {
          eventId: mongoose.Types.ObjectId(anEvent.eventId),
          reclaimed: false,
        },
      },
      { $group: { _id: null, grantsFromEverybody: { $sum: '$value' } } },
    ]);

    const totalGrantsToSpend = Math.floor(
      anEvent.totalBudget / anEvent.grantValue
    );

    return (grantsFromEverybody + grantAmount <= totalGrantsToSpend)

  },
  giveGrant: async (eventId, dreamId, fromUser, value) => {
    const [event, currentMember, dream] = await Promise.all([
      Event.findOne({ _id: eventId }),
      Member.findOne({ userId: fromUser.id, eventId, }),
      Dream.findOne({ _id: dreamId, eventId })
    ]);

    if (value <= 0) 
      throw new Error('Value needs to be more than zero');

    if (!currentMember || !currentMember.isApproved)
      throw new Error( 'Approved member necessary to give grants');

    if (!event.grantingIsOpen) 
      throw new Error('Granting is not open');

    if (!dream.approved)
      throw new Error('Dream is not approved for granting');

    // Check that the max goal of the dream is not exceeded
    if(!await controller.hasRoomInBudgetForGrantOfSize(dream, value))
      throw new Error("You can't overfund this dream.");

    // Check that it is not more than is allowed per dream (if this number is set)
    // TODO This value seems illogical anyway, what if there are two grants?
    if (event.maxGrantsToDream && value > event.maxGrantsToDream) {
      throw new Error(
        `You can give a maximum of ${event.maxGrantsToDream} grants to one dream`
      );
    }

    // Check that user has not spent more grants than he has
    if (!await controller.canGiveNumberOfGrantsMore(currentMember, event, value))
      throw new Error('You are trying to spend too many grants.');

    if (!await controller.eventBudgetWontBeExceededBy(event, value))
      throw new Error('Total budget of event is exeeced with this grant');

    return new Grant({
      eventId: currentMember.eventId,
      dreamId,
      value,
      memberId: currentMember.id,
    }).save();
  }
})

let controller = null

module.exports = models => {
  if (controller == null) controller = createController(models);
  return controller;
}
