import { useState, useEffect } from 'react';
import { Transaction, TransactionStore } from '../types';

const STORAGE_KEY = 'finance_tracker_data';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: TransactionStore = JSON.parse(stored);
      setTransactions(data.transactions);
    }
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions: updatedTransactions }));
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions: updatedTransactions }));
  };

  const getBalance = () => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'income') return acc + curr.amount;
      if (curr.type === 'expense') return acc - curr.amount;
      return acc;
    }, 0);
  };

  const getTotalLoans = () => {
    return transactions
      .filter(t => t.type === 'loan')
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    getBalance,
    getTotalLoans,
  };
}