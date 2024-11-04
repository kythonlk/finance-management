import React from 'react';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Dashboard } from './components/Dashboard';
import { useTransactions } from './hooks/useTransactions';
import { Wallet } from 'lucide-react';

function App() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, getBalance, getTotalLoans } = useTransactions();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Wallet className="w-8 h-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Finance Tracker</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard
          balance={getBalance()}
          totalLoans={getTotalLoans()}
          transactions={transactions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Transaction</h2>
            <TransactionForm onSubmit={addTransaction} />
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            <TransactionList
              transactions={transactions}
              onDelete={deleteTransaction}
              onUpdate={updateTransaction}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;