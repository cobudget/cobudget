const mongoose = require("mongoose");

const allocateToMember = async (
  { eventMemberId, eventId, organizationId, amount, type },
  { Allocation, Contribution }
) => {
  if (type === "ADD") {
    await new Allocation({
      organizationId,
      eventId,
      eventMemberId,
      amount,
    }).save();
  } else if (type === "SET") {
    const [
      { totalAllocations } = { totalAllocations: 0 },
    ] = await Allocation.aggregate([
      {
        $match: {
          eventMemberId: mongoose.Types.ObjectId(eventMemberId),
        },
      },
      { $group: { _id: null, totalAllocations: { $sum: "$amount" } } },
    ]);

    const [
      { totalContributions } = { totalContributions: 0 },
    ] = await Contribution.aggregate([
      {
        $match: {
          eventMemberId: mongoose.Types.ObjectId(eventMemberId),
        },
      },
      { $group: { _id: null, totalContributions: { $sum: "$amount" } } },
    ]);

    const balance = totalAllocations - totalContributions;

    const adjustment = amount - balance;

    await new Allocation({
      organizationId,
      eventId,
      eventMemberId,
      amount: adjustment,
    }).save();
  }
};

module.exports = { allocateToMember };
