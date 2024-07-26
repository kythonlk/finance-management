import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <aside
      className={`absolute left-0 text-white top-0 z-9999 flex h-screen w-72 flex-col overflow-y-hidden bg-[#1c2434] duration-300 ease-linear lg:static lg:translate-x-0 `}
    >
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6 ml-4">
          <div>
            <h3 className="mb-4  text-sm font-semibold text-bodydark2">
              MENU
            </h3>
            <ul className="space-y-2">
              <li><Link to="/">Overview</Link></li>
              <li><Link to="/expenses">Expenses</Link></li>
              <li><Link to="/earnings">Earnings</Link></li>
              <li><Link to="/savings">Savings</Link></li>
              <li><Link to="/budgets">Budgets</Link></li>
              <li><Link to="/settings">Go to Settings</Link></li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;