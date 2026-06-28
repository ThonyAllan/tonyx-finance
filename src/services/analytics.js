import { store } from '../core/store.js';
import { currentMonth, shiftMonth, isInMonth, isToday, toDisplay } from '../core/dates.js';
import { getById } from '../models/categories.js';

export function computeDashboard() {
  const state = store.getState();
  const month = currentMonth();
  const prevMonth = shiftMonth(month, -1);

  const openingBalance = state.settings.openingBalance ?? 0;

  const allIncomes = state.incomes ?? [];
  const allExpenses = state.expenses ?? [];

  const totalIncomeAll = allIncomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenseAll = allExpenses.reduce((s, e) => s + e.amount, 0);
  const balance = openingBalance + totalIncomeAll - totalExpenseAll;

  const monthIncomes = allIncomes.filter(i => isInMonth(i.date, month));
  const monthExpenses = allExpenses.filter(e => isInMonth(e.date, month));
  const totalIncomeMonth = monthIncomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenseMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);

  // Category with highest spend this month
  const catSpend = {};
  monthExpenses.forEach(e => {
    if (e.categoryId) catSpend[e.categoryId] = (catSpend[e.categoryId] ?? 0) + e.amount;
  });
  let topCatId = null, topCatAmount = 0;
  Object.entries(catSpend).forEach(([id, amt]) => {
    if (amt > topCatAmount) { topCatAmount = amt; topCatId = id; }
  });
  const topCategory = topCatId ? getById(topCatId) : null;

  // Previous month expenses for delta
  const prevExpenses = allExpenses.filter(e => isInMonth(e.date, prevMonth));
  const totalExpensePrev = prevExpenses.reduce((s, e) => s + e.amount, 0);

  // Recent transactions (last 10, any month)
  const recent = [
    ...allIncomes.map(i => ({ ...i, _type: 'income' })),
    ...allExpenses.map(e => ({ ...e, _type: 'expense' })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 10);

  return {
    balance,
    totalDebt: 0,          // v1 feature — debts not implemented yet
    netWorth: balance,     // balance - totalDebt
    totalIncomeMonth,
    totalExpenseMonth,
    totalExpensePrev,
    topCategory,
    topCatAmount,
    todayDue: 0,           // v1
    nextDue: null,         // v1
    pendingCount: 0,       // v1
    recent,
  };
}
