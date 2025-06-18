import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Container from './components/Container';
import AddModal from './components/AddModal';
import UpdateModal from './components/updateModal';
import SpinnerOverlay from '../../components/spinningOverlay';
import CustomAlert from '../../components/CustomAlert';

const Manage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [mode, setMode] = useState('none');
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

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

  const handleDeleteSheets = async () => {
    if (selectedSheets.length === 0) {
      setAlert({ message: 'No sheets selected for deletion.', type: 'error' });
      return;
    }

    try {
      setLoading(true);

      for (const sheetId of selectedSheets) {
        const sheet = sheets.find(s => s.id === sheetId);
        if (sheet) {
          await axios.delete(`${API_URL}/api/database/delete`, {
            data: {
              sheet_id: sheet.sheet_id,
              tab_name: sheet.database_name
            }
          });
        }
      }

      setAlert({ message: 'Selected sheets deleted successfully.', type: 'success' });
      resetMode();
      fetchSheets();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete one or more sheets.';
      setAlert({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

const groupSheetsByFile = () => {
  const groups = {};

  sheets.forEach(sheet => {
    if (sheet.database_name === 'Sheet1') return;

    const id = sheet.sheet_id;
    if (!groups[id]) {
      groups[id] = {
        ...sheet,
        tabs: [],
      };
    }
    groups[id].tabs.push({
      tab_name: sheet.database_name,
      tab_id: sheet.id,
    });
  });

  return Object.values(groups);
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

      <h1 className="text-3xl font-bold text-white mb-10 relative z-20">Manage Database</h1>

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

      {mode === 'delete' && selectedSheets.length > 0 && (
        <button
          onClick={handleDeleteSheets}
          className="mb-6 bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 z-20"
        >
          Delete Selected Database
        </button>
      )}

      <div className="bg-white rounded-lg shadow-md max-w-6xl mx-auto p-6 text-left relative z-20">
        <h2 className="text-xl font-semibold mb-4">Available Databases</h2>
        {sheets.length === 0 ? (
          <p className="text-gray-500">No Databases found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {groupSheetsByFile().map((group, idx) => (
              <div key={group.sheet_id || idx} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {group.department_name || 'Untitled'} - Database
                </h3>
                <ul className="space-y-2">
                  {group.tabs.map((tab, i) => {
                    const isSelected = selectedSheets.includes(tab.tab_id);
                    return (
                      <li
                        key={tab.tab_id || i}
                        onClick={() =>
                          handleSheetClick({ ...group, database_name: tab.tab_name, id: tab.tab_id })
                        }
                        className={`px-3 py-2 rounded cursor-pointer text-left border 
                          ${mode === 'delete' && isSelected ? 'bg-red-100 border-red-400' : 'hover:bg-gray-100'}`
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{tab.tab_name}</span>
                          {mode === 'delete' && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelect(tab.tab_id);
                              }}
                              className="w-4 h-4 ml-2"
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchSheets}
          setAlert={setAlert}
        />
      )}

      {showUpdateModal && activeSheet && (
        <UpdateModal
          sheet={activeSheet}
          setAlert={setAlert}
          onClose={() => {
            setShowUpdateModal(false);
            setActiveSheet(null);
            fetchSheets();
          }}
        />
      )}

      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};

export default Manage;
