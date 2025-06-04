// src/pages/settings/Settings.jsx
import React from 'react';
import SideTab from './components/SideTab';
import { Outlet } from 'react-router-dom';
import NavBar from '../../components/NavBar';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400">
      <NavBar />
      <div className="flex p-6 space-x-6">
        <SideTab />
        <div className="flex-1 bg-white rounded-xl shadow-md p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Settings;
