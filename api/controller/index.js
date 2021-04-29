const mongoose = require("mongoose");

const allocateToMember = async (
  { eventMemberId, eventId, organizationId, amount, type },
  { Allocation, Contribution }
) => {
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

  if (type === "ADD") {
    const adjustedAmount = balance + amount >= 0 ? amount : -balance;
    await new Allocation({
      organizationId,
      eventId,
      eventMemberId,
      amount: adjustedAmount,
    }).save();
  } else if (type === "SET") {
    if (amount < 0) throw new Error("Can't set negative values");

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
