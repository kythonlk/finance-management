import React, { useState, useEffect } from 'react';
import LocalStorageClient from '../utils/local.ts';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getRandomColor } from '../utils/color';

const expenseClient = new LocalStorageClient('expenses');
const earningsClient = new LocalStorageClient('earnings');
const budgetClient = new LocalStorageClient('upcomingPayments');
const savingsClient = new LocalStorageClient('savings');
const currenciesClient = new LocalStorageClient('userCurrencies');
const exchangeRatesClient = new LocalStorageClient('exchangeRates');

function Overview() {
  const [expenses, setExpenses] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [savings, setSavings] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    const fetchData = () => {
      setExpenses(expenseClient.select());
      setEarnings(earningsClient.select());
      setUpcomingPayments(budgetClient.select());
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

  const totalEarningsInUSD = calculateTotalInUSD(earnings);
  const totalExpensesInUSD = calculateTotalInUSD(expenses);
  const balanceInUSD = (totalEarningsInUSD - totalExpensesInUSD).toFixed(2);

  const pieChartColors = currencyOptions.map(() => getRandomColor());

  const date = new Date();
  const today = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

  const addSampleData = () => {
    const sampleExpenses = [
      { id: 1, amount: 200, currency: 'USD', description: 'Rent' },
      { id: 2, amount: 50, currency: 'USD', description: 'Utilities' },
      { id: 3, amount: 1000, currency: 'EUR', description: 'Vacation' },
    ];
    const sampleEarnings = [
      { id: 1, amount: 5000, currency: 'USD', description: 'Salary' },
      { id: 2, amount: 300, currency: 'EUR', description: 'Freelance Work' },
    ];
    const sampleUpcomingPayments = [
      { id: 1, amount: 150, description: 'Gym Membership' },
      { id: 2, amount: 200, description: 'Subscription Service' },
    ];
    const sampleSavings = [
      { id: 1, amount: 5000, description: 'Emergency Fund' },
      { id: 2, amount: 1500, description: 'Vacation Savings' },
    ];
    const sampleCurrencies = [
      { currency: 'USD' },
      { currency: 'EUR' },
    ];
    const sampleExchangeRates = [
      { currency: 'USD', rate: 1, lastUpdated: new Date().toISOString() },
      { currency: 'EUR', rate: 0.9, lastUpdated: new Date().toISOString() },
    ];

    expenseClient.clear();
    earningsClient.clear();
    budgetClient.clear();
    savingsClient.clear();
    currenciesClient.clear();
    exchangeRatesClient.clear();

    sampleExpenses.forEach(item => expenseClient.insert(item));
    sampleEarnings.forEach(item => earningsClient.insert(item));
    sampleUpcomingPayments.forEach(item => budgetClient.insert(item));
    sampleSavings.forEach(item => savingsClient.insert(item));
    sampleCurrencies.forEach(item => currenciesClient.insert(item));
    sampleExchangeRates.forEach(item => exchangeRatesClient.insert(item));

    // Re-fetch data after adding sample data
    setExpenses(expenseClient.select());
    setEarnings(earningsClient.select());
    setUpcomingPayments(budgetClient.select());
    setSavings(savingsClient.select());
    setCurrencyOptions(sampleCurrencies.map(item => ({ value: item.currency, label: `${item.currency} - ${item.currency}` })));
    setExchangeRates(sampleExchangeRates.reduce((acc, { currency, rate }) => {
      acc[currency] = rate;
      return acc;
    }, {}));
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="mt-6 flex justify-between">
        <h2 className="text-lg font-semibold">Total Balance in USD up to {today}</h2>
        <div className="text-gray-500">{balanceInUSD} USD</div>
      </div>
      <button onClick={addSampleData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Add Sample Data
      </button>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                {dataForPieChart(expenses).map((_, index) => (
                  <Cell key={`cell-expenses-${index}`} fill={pieChartColors[index]} />
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
                {dataForPieChart(earnings).map((_, index) => (
                  <Cell key={`cell-earnings-${index}`} fill={pieChartColors[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Upcoming Payments</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={upcomingPayments.map(payment => ({
                name: payment.description,
                amount: payment.amount
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
                name: saving.description,
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
      </div>
    </div>
  );
}

export default Overview;
