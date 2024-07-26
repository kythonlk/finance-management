import React, { useState, useEffect } from 'react';
import LocalStorageClient from '../utils/local.ts';
import { Input } from './ui/Input';
import Select from './ui/Select.jsx';

const budgetsClient = new LocalStorageClient('budgets');
const currenciesClient = new LocalStorageClient('userCurrencies');
const exchangeRatesClient = new LocalStorageClient('exchangeRates');

function Budgets() {
    const [budgets, setBudgets] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [editBudgetId, setEditBudgetId] = useState(null);
    const [editingDescription, setEditingDescription] = useState('');
    const [editingAmount, setEditingAmount] = useState('');
    const [editingCurrency, setEditingCurrency] = useState('');
    const [exchangeRates, setExchangeRates] = useState({});

    useEffect(() => {
        const fetchCurrencies = () => {
            const storedCurrencies = currenciesClient._getTable();
            setCurrencyOptions(storedCurrencies.map(item => ({ value: item.currency, label: `${item.currency} - ${item.currency}` })));
        };

        const fetchExchangeRates = () => {
            const storedExchangeRates = exchangeRatesClient._getTable();
            // Transform the array into an object for easier access
            const ratesObject = storedExchangeRates.reduce((acc, rate) => {
                acc[rate.currency] = rate.rate;
                return acc;
            }, {});
            setExchangeRates(ratesObject);
        };

        fetchCurrencies();
        fetchExchangeRates();
        setBudgets(budgetsClient.select());
    }, []);

    const addBudget = (e) => {
        e.preventDefault();
        if (description.trim() && amount && selectedCurrency) {
            const budget = budgetsClient.insert({ 
                description, 
                amount: parseFloat(amount), 
                currency: selectedCurrency,
                date: new Date().toISOString() 
            });
            setBudgets([...budgets, budget]);
            setDescription('');
            setAmount('');
            setSelectedCurrency('');
        }
    };

    const updateBudget = (id) => {
        if (editingDescription.trim() && editingAmount && editingCurrency) {
            budgetsClient.update({ id }, { 
                description: editingDescription, 
                amount: parseFloat(editingAmount), 
                currency: editingCurrency 
            });
            setBudgets(budgetsClient.select());
            setEditBudgetId(null);
            setEditingDescription('');
            setEditingAmount('');
            setEditingCurrency('');
        }
    };

    const deleteBudget = (id) => {
        budgetsClient.delete({ id });
        setBudgets(budgetsClient.select());
    };

    const startEdit = (budget) => {
        setEditingDescription(budget.description);
        setEditingAmount(budget.amount.toString());
        setEditingCurrency(budget.currency);
        setEditBudgetId(budget.id);
    };

    const cancelEdit = () => {
        setEditBudgetId(null);
        setEditingDescription('');
        setEditingAmount('');
        setEditingCurrency('');
    };

    const calculateTotal = (currency) => {
        const total = budgets
            .filter(budget => budget.currency === currency)
            .reduce((sum, budget) => sum + budget.amount, 0);
        return total.toFixed(2);
    };

    const calculateTotalInUSD = () => {
        return budgets.reduce((sum, budget) => {
            const rate = exchangeRates[budget.currency] || 1;
            return sum + (budget.amount / rate);
        }, 0).toFixed(2);
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold">Budgets</h1>
            <form onSubmit={editBudgetId === null ? addBudget : (e) => { e.preventDefault(); updateBudget(editBudgetId); }} className="mt-4 space-y-4">
                <Input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    disabled={editBudgetId !== null}
                />
                <div className="flex justify-between gap-8">
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        step="0.01"
                        disabled={editBudgetId !== null}
                    />
                    <Select
                        options={currencyOptions}
                        value={selectedCurrency}
                        onChange={(value) => setSelectedCurrency(value)}
                        placeholder="Select Currency"
                        disabled={editBudgetId !== null}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {editBudgetId === null ? 'Add Budget' : 'Update Budget'}
                </button>
            </form>
            <ul className="divide-y divide-gray-200 mt-6">
                {budgets.map((budget) => (
                    <li key={budget.id} className="py-4 flex items-center justify-between">
                        {editBudgetId === budget.id ? (
                            <div className="flex gap-4 w-full">
                                <Input
                                    type="text"
                                    value={editingDescription}
                                    onChange={(e) => setEditingDescription(e.target.value)}
                                    placeholder="Description"
                                />
                                <Input
                                    type="number"
                                    value={editingAmount}
                                    onChange={(e) => setEditingAmount(e.target.value)}
                                    placeholder="Amount"
                                    step="0.01"
                                />
                                <Select
                                    options={currencyOptions}
                                    value={editingCurrency}
                                    onChange={(value) => setEditingCurrency(value)}
                                    placeholder="Select Currency"
                                />
                                <div className="mt-2 flex space-x-4">
                                    <button
                                        onClick={() => updateBudget(budget.id)}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between w-full">
                                <div>
                                    <span className="font-medium">{budget.description}</span>
                                    <span className="block text-gray-500 text-sm">{new Date(budget.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-4">
                                        {budget.amount.toFixed(2)} {budget.currency}
                                    </span>
                                    <button
                                        onClick={() => startEdit(budget)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteBudget(budget.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            <div className="mt-6">
                <h2 className="text-lg font-semibold">Total Budget by Currency</h2>
                <ul className="mt-2 flex gap-8">
                    {currencyOptions.map(({ value, label }) => (
                        <li key={value} className="p-2 flex items-center justify-between">
                            <span className="font-medium">{label}</span>
                            <span className="text-gray-500">{calculateTotal(value)} {value}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-6">
                <h2 className="text-lg font-semibold">Total Budget in USD</h2>
                <div className="p-2 flex items-center justify-between">
                    <span className="font-medium">USD</span>
                    <span className="text-gray-500">{calculateTotalInUSD()} USD</span>
                </div>
            </div>
        </div>
    );
}

export default Budgets;
