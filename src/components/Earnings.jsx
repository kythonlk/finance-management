import React, { useState, useEffect } from 'react';
import LocalStorageClient from '../utils/local.ts';
import { Input } from './ui/Input';
import Select from './ui/Select.jsx';

const earningsClient = new LocalStorageClient('earnings');
const currenciesClient = new LocalStorageClient('userCurrencies');
const exchangeRatesClient = new LocalStorageClient('exchangeRates');

function Earnings() {
    const [earnings, setEarnings] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [editEarningId, setEditEarningId] = useState(null);
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
        setEarnings(earningsClient.select());
    }, []);

    const addEarning = (e) => {
        e.preventDefault();
        if (description.trim() && amount && selectedCurrency) {
            const earning = earningsClient.insert({ 
                description, 
                amount: parseFloat(amount), 
                currency: selectedCurrency,
                date: new Date().toISOString() 
            });
            setEarnings([...earnings, earning]);
            setDescription('');
            setAmount('');
            setSelectedCurrency('');
        }
    };

    const updateEarning = (id) => {
        if (editingDescription.trim() && editingAmount && editingCurrency) {
            earningsClient.update({ id }, { 
                description: editingDescription, 
                amount: parseFloat(editingAmount), 
                currency: editingCurrency 
            });
            setEarnings(earningsClient.select());
            setEditEarningId(null);
            setEditingDescription('');
            setEditingAmount('');
            setEditingCurrency('');
        }
    };

    const deleteEarning = (id) => {
        earningsClient.delete({ id });
        setEarnings(earningsClient.select());
    };

    const startEdit = (earning) => {
        setEditingDescription(earning.description);
        setEditingAmount(earning.amount.toString());
        setEditingCurrency(earning.currency);
        setEditEarningId(earning.id);
    };

    const cancelEdit = () => {
        setEditEarningId(null);
        setEditingDescription('');
        setEditingAmount('');
        setEditingCurrency('');
    };

    const calculateTotal = (currency) => {
        const total = earnings
            .filter(earning => earning.currency === currency)
            .reduce((sum, earning) => sum + earning.amount, 0);
        return total.toFixed(2);
    };

    const calculateTotalInUSD = () => {
        return earnings.reduce((sum, earning) => {
            const rate = exchangeRates[earning.currency] || 1;
            return sum + (earning.amount / rate);
        }, 0).toFixed(2);
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold">Earnings</h1>
            <form onSubmit={editEarningId === null ? addEarning : (e) => { e.preventDefault(); updateEarning(editEarningId); }} className="mt-4 space-y-4">
                <Input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    disabled={editEarningId !== null}
                />
                <div className="flex justify-between gap-8">
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        step="0.01"
                        disabled={editEarningId !== null}
                    />
                    <Select
                        options={currencyOptions}
                        value={selectedCurrency}
                        onChange={(value) => setSelectedCurrency(value)}
                        placeholder="Select Currency"
                        disabled={editEarningId !== null}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {editEarningId === null ? 'Add Earning' : 'Update Earning'}
                </button>
            </form>
            <ul className="divide-y divide-gray-200 mt-6">
                {earnings.map((earning) => (
                    <li key={earning.id} className="py-4 flex items-center justify-between">
                        {editEarningId === earning.id ? (
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
                                        onClick={() => updateEarning(earning.id)}
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
                                    <span className="font-medium">{earning.description}</span>
                                    <span className="block text-gray-500 text-sm">{new Date(earning.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-4">
                                        {earning.amount.toFixed(2)} {earning.currency}
                                    </span>
                                    <button
                                        onClick={() => startEdit(earning)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteEarning(earning.id)}
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
                <h2 className="text-lg font-semibold">Balance by Currency</h2>
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
                <h2 className="text-lg font-semibold">Total Balance in USD</h2>
                <div className="p-2 flex items-center justify-between">
                    <span className="font-medium">USD</span>
                    <span className="text-gray-500">{calculateTotalInUSD()} USD</span>
                </div>
            </div>
        </div>
    );
}

export default Earnings;
