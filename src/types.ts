export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'loan';
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface TransactionStore {
  transactions: Transaction[];
}