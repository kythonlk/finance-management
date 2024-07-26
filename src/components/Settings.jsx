import React, { useState, useEffect } from 'react';
import Select from './ui/Select.jsx';
import Button from './ui/Button.jsx';
import LocalStorageClient from '../utils/local.ts';

const currenciesClient = new LocalStorageClient('userCurrencies');
const ratesClient = new LocalStorageClient('exchangeRates');

const fetchExchangeRates = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {};
  }
};

const Settings = () => {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    const loadSettings = async () => {
      const storedCurrencies = currenciesClient._getTable();
      const storedRates = ratesClient._getTable();
      const now = new Date();

      const lastUpdated = storedRates.length ? new Date(storedRates[0].lastUpdated) : null;
      const diffDays = lastUpdated
        ? Math.ceil((now - lastUpdated) / (1000 * 60 * 60 * 24))
        : 3;

      if (storedCurrencies.length && (diffDays < 3 || !lastUpdated)) {
        setCurrencies(storedCurrencies.map(item => item.currency));
        setExchangeRates(
          storedRates.reduce((acc, rate) => {
            acc[rate.currency] = rate.rate;
            return acc;
          }, {})
        );
      } else {
        const rates = await fetchExchangeRates();
        const updatedRates = Object.keys(rates).map(currency => ({
          currency,
          rate: rates[currency],
          lastUpdated: now.toISOString(),
        }));

        ratesClient._setTable(updatedRates);
        setExchangeRates(updatedRates.reduce((acc, rate) => {
          acc[rate.currency] = rate.rate;
          return acc;
        }, {}));
        setCurrencies(storedCurrencies.map(item => item.currency));
      }
    };

    loadSettings();
  }, []);

  const addCurrency = async () => {
    if (selectedCurrency && currencies.length < 10 && !currencies.includes(selectedCurrency)) {
      const updatedCurrencies = [...currencies, selectedCurrency];
      currenciesClient.insert({ currency: selectedCurrency });
      await updateSettings(updatedCurrencies);
      setCurrencies(updatedCurrencies);
    }
  };

  const deleteCurrency = (currency) => {
    const updatedCurrencies = currencies.filter(c => c !== currency);
    currenciesClient.delete({ currency });
    updateSettings(updatedCurrencies);
    setCurrencies(updatedCurrencies);
  };

  const updateSettings = async (updatedCurrencies) => {
    const now = new Date();
    const allRates = await fetchExchangeRates();
    
    const filteredRates = updatedCurrencies.map(currency => ({
      currency,
      rate: allRates[currency] !== undefined ? allRates[currency] : 'N/A',
      lastUpdated: now.toISOString()
    }));

    ratesClient._setTable(filteredRates);
    setExchangeRates(filteredRates.reduce((acc, rate) => {
      acc[rate.currency] = rate.rate;
      return acc;
    }, {}));
  };

  const options = [
    { value: 'USD', label: 'USD - United States Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'GBP', label: 'GBP - British Pound Sterling' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'CHF', label: 'CHF - Swiss Franc' },
    { value: 'CNY', label: 'CNY - Chinese Yuan' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'AED', label: 'AED - United Arab Emirates Dirham' },
    { value: 'LKR', label: 'LKR - Sri Lankan Rupee' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <h2 className="text-xl pt-10 font-semibold">Currencies</h2>
      <div className="mt-4 space-y-4">
        <div className='flex justify-center gap-4'>
          <Select
            options={options}
            value={selectedCurrency}
            onChange={(value) => setSelectedCurrency(value)}
            placeholder="Select Currency"
          />
          <Button
            onClick={addCurrency}
            className="w-full"
            variant="primary"
          >
            Add Currency
          </Button>
        </div>
        <div>
          <ul className="mt-2 divide-y divide-gray-200">
            {currencies.map((currency) => (
              <li key={currency} className="py-2 flex items-center justify-between">
                <span className="font-medium">{currency}</span>
                <span className="text-gray-500">{exchangeRates[currency] !== undefined ? exchangeRates[currency] : 'N/A'}</span>
                <button
                  onClick={() => deleteCurrency(currency)}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;
