import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Container from './components/Container';
import AddModal from './components/AddModal';
import UpdateModal from './components/updateModal';
import SpinnerOverlay from '../../components/spinningOverlay'; // <-- Spinner component

const Manage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [mode, setMode] = useState('none');
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [loading, setLoading] = useState(true); // <-- loading state

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/database/databases`);
      setSheets(res.data.sheets || []);
    } catch (err) {
      console.error('Failed to fetch Google Sheets', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedSheets(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const resetMode = () => {
    setMode('none');
    setSelectedSheets([]);
  };

  const isActive = (targetMode) => mode === targetMode;

  const handleSheetClick = (sheet) => {
    if (mode === 'update') {
      setActiveSheet(sheet);
      setShowUpdateModal(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 p-10 text-center">
      {loading && <SpinnerOverlay />}

      {(mode === 'update' || mode === 'delete') && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10 pointer-events-none" />
      )}

      <button
        onClick={() => navigate('/home')}
        className="absolute top-5 right-5 z-30 bg-white text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-100"
      >
        ← Back to Home
      </button>

      <h1 className="text-3xl font-bold text-white mb-10 relative z-20">Manage Google Sheets</h1>

      <div className="flex justify-center gap-10 mb-10 relative z-20">
        <div className={mode !== 'none' && mode !== 'add' ? 'opacity-40 pointer-events-none' : ''}>
          <Container title="Add" icon="➕" onClick={() => { resetMode(); setShowAddModal(true); }} />
        </div>
        <div className={mode !== 'none' && mode !== 'update' ? 'opacity-40 pointer-events-none' : ''}>
          <Container title="Update" icon="✏️" onClick={() => setMode(isActive('update') ? 'none' : 'update')} />
        </div>
        <div className={mode !== 'none' && mode !== 'delete' ? 'opacity-40 pointer-events-none' : ''}>
          <Container title="Delete" icon="🗑️" onClick={() => setMode(isActive('delete') ? 'none' : 'delete')} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md max-w-6xl mx-auto p-6 text-left relative z-20">
        <h2 className="text-xl font-semibold mb-4">Available Databases</h2>
        {sheets.length === 0 ? (
          <p className="text-gray-500">No Google Sheets found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sheets.map((sheet, idx) => (
              <div
                key={sheet.id || idx}
                onClick={() => handleSheetClick(sheet)}
                className="flex items-center justify-between gap-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:bg-gray-100 cursor-pointer"
              >
                {mode === 'delete' && (
                  <input
                    type="checkbox"
                    checked={selectedSheets.includes(sheet.id)}
                    onChange={() => toggleSelect(sheet.id)}
                    className="w-4 h-4"
                  />
                )}
                <div className="flex-1 text-gray-800 font-medium">
                  {sheet.database_name || sheet.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddModal onClose={() => setShowAddModal(false)} onCreated={fetchSheets} />
      )}
      {showUpdateModal && (
        <UpdateModal
          sheet={activeSheet}
          onClose={() => {
            setShowUpdateModal(false);
            setActiveSheet(null);
            fetchSheets();
          }}
        />
      )}
    </div>
  );
};

export default Manage;
