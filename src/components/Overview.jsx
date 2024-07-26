import React, { useState, useEffect } from 'react';
import LocalStorageClient from '../utils/local.ts';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const expenseClient = new LocalStorageClient('expenses');
const earningsClient = new LocalStorageClient('earnings');
const budgetClient = new LocalStorageClient('budgets');
const savingsClient = new LocalStorageClient('savings');
const currenciesClient = new LocalStorageClient('userCurrencies');
const exchangeRatesClient = new LocalStorageClient('exchangeRates');

function Overview() {
  const [expenses, setExpenses] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savings, setSavings] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    const fetchData = () => {
      setExpenses(expenseClient.select());
      setEarnings(earningsClient.select());
      setBudgets(budgetClient.select());
      setSavings(savingsClient.select());

      const storedCurrencies = currenciesClient._getTable();
      setCurrencyOptions(storedCurrencies.map(item => ({ value: item.currency, label: `${item.currency} - ${item.currency}` })));

      const storedExchangeRates = exchangeRatesClient._getTable();
      setExchangeRates(storedExchangeRates.reduce((acc, { currency, rate }) => {
        acc[currency] = rate;
        return acc;
      }, {}));
    };

    fetchData();
  }, []);

  const calculateTotal = (items, currency) => {
    return items
      .filter(item => item.currency === currency)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotalInUSD = (items) => {
    return items.reduce((sum, item) => {
      const rate = exchangeRates[item.currency] || 1;
      return sum + (item.amount / rate);
    }, 0).toFixed(2);
  };

  const dataForPieChart = (items) => {
    return currencyOptions.map(({ value }) => ({
      name: value,
      value: calculateTotal(items, value)
    }));
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Expenses by Currency</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataForPieChart(expenses)}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              fill="#8884d8"
              label
            >
              {currencyOptions.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value === 'USD' ? '#82ca9d' : '#8884d8'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Earnings by Currency</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataForPieChart(earnings)}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              fill="#82ca9d"
              label
            >
              {currencyOptions.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value === 'USD' ? '#82ca9d' : '#8884d8'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Budgets</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={budgets.map(budget => ({
              name: budget.name,
              amount: budget.amount
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Savings</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={savings.map(saving => ({
              name: saving.name,
              amount: saving.amount
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Total Balance in USD</h2>
        <div className="p-2 flex items-center justify-between">
          <span className="font-medium">USD</span>
          <span className="text-gray-500">{calculateTotalInUSD(expenses)} USD</span>
        </div>
      </div>
    </div>
  );
}

export default Overview;
