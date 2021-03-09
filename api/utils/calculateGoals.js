const calculateGoals = (budgetItems) => {
  if (!budgetItems) return { min: null, max: null };
  const incomes = budgetItems
    .filter((item) => item.type === "INCOME")
    .reduce((acc, item) => acc + item.min, 0);
  const minExpenses = budgetItems
    .filter((item) => item.type === "EXPENSE")
    .reduce((acc, item) => acc + item.min, 0);

  const maxExpenses = budgetItems
    .filter((item) => item.type === "EXPENSE")
    .reduce((acc, item) => acc + (item.max ? item.max : item.min), 0);

  const min = minExpenses - incomes;
  const max = maxExpenses - incomes;
  return {
    max: max > 0 && max !== min ? max : null,
    min: min > 0 ? min : 0,
  };
};

module.exports = calculateGoals;
