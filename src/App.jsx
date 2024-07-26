import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import Expenses from './components/Expenses';
import Earnings from './components/Earnings';
import Savings from './components/Savings';
import Budgets from './components/Budgets';
import Settings from './components/Settings';

function App() {
  return (
    <Router>
      <div className="dark:bg-boxdark-2 dark:text-bodydark">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <main>
              <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/earnings" element={<Earnings />} />
                  <Route path="/savings" element={<Savings />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
