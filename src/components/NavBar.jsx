import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/authContext';
import { FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const firstName = user?.first_name || 'Guest';
  const role = user?.role || '';

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/30 shadow-md sticky top-0 z-40">
      <div className="text-xl font-semibold text-gray-800">
        {/* Logo placeholder or app name */}
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(prev => !prev)}
          className="flex items-center gap-2 bg-white/60 p-2 rounded-full shadow-md hover:bg-white/80 transition duration-200"
        >
          <FiUser size={20} className="text-gray-700" />
        </button>

        {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-3 px-4 transition-all duration-300 ease-in-out z-50">
            <p className="text-gray-700 text-sm mb-2">
            Welcome, <strong>{firstName}</strong>
            </p>
            <ul className="space-y-2 text-sm">
            <li
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => navigate('/settings/account')}
            >
                Account Settings
            </li>

            {role !== 'user' && (
                <>
                <li
                    className="cursor-pointer hover:text-blue-600 transition"
                    onClick={() => navigate('/settings/management')}
                >
                    Account Management
                </li>
                </>
            )}
            {role === 'super_admin' && (
                <>
                <li
                    className="cursor-pointer hover:text-blue-600 transition"
                    onClick={() => navigate('/settings/department')}
                >
                    Department Management
                </li>
                </>
            )}

            <li
                className="cursor-pointer text-red-600 hover:text-red-700 transition"
                onClick={logout}
            >
                Logout
            </li>
            </ul>
        </div>
        )}

      </div>
    </nav>
  );
};

export default NavBar;
