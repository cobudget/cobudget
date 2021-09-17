const calculateGoals = (budgetItems) => {
  if (!budgetItems) return { min: null, max: null };
  const allIncomes = budgetItems
    .filter((item) => item.type === "INCOME")
    .reduce((acc, item) => acc + item.min, 0);

  const minExpenses = budgetItems
    .filter((item) => item.type === "EXPENSE")
    .reduce((acc, item) => acc + item.min, 0);

  const maxExpenses = budgetItems
    .filter((item) => item.type === "EXPENSE")
    .reduce((acc, item) => acc + (item.max ? item.max : item.min), 0);

  // times 100 to provide value in cents
  // TODO: make budget items store value in cents
  const min = minExpenses * 100;
  const max = maxExpenses * 100;
  const incomes = allIncomes * 100;

  return {
    max: max > 0 && max !== min ? max : null,
    min: min > 0 ? min : 0,
    incomes: incomes,
  };
};

module.exports = calculateGoals;
