import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/authContext';

const SideTab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();


  const handleLogout = async () => {
    await logout();
    setTimeout(() => navigate('/'), 0);
  };

  const tabs = [
    { label: 'Account', path: '/settings/account' },
  ];

  // ✅ Add Account Management tab only for admin role
  if (user?.role !== 'user') {
    tabs.push({ label: 'Account Management', path: '/settings/management' });
  }
    if (user?.role === 'super_admin' ) {
    tabs.push({ label: 'Department Management', path: '/settings/department' });
  }

  return (
    <div className="w-48 h-full min-h-[400px] bg-white/80 p-4 rounded-xl shadow-md flex flex-col justify-between">
      {/* Top: Navigation Tabs */}
      <div className="space-y-4">
        {tabs.map((tab, index) => (
          <div
            key={index}
            onClick={() => navigate(tab.path)}
            className={`cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition
              ${location.pathname === tab.path
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100 text-gray-800'}`}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Bottom: Logout Button */}
        <button
        onClick={handleLogout}
        className="w-full mt-6 px-3 py-2 rounded-md text-sm font-semibold text-red-600 border border-red-300 hover:bg-red-50 transition"
        >
        Logout
        </button>
    </div>
  );
};

export default SideTab;
