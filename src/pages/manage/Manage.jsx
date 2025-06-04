import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Container from './components/Container';
import AddModal from './components/AddModal';

const Manage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [csvFiles, setCsvFiles] = useState([]);
  const [mode, setMode] = useState('none'); // 'none' | 'update' | 'delete'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/contracts')
      .then(res => setCsvFiles(Object.keys(res.data)))
      .catch(err => console.error('Failed to fetch CSV files', err));
  }, []);

  const toggleSelect = (filename) => {
    setSelectedFiles(prev =>
      prev.includes(filename)
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  const resetMode = () => {
    setMode('none');
    setSelectedFiles([]);
  };

  const isActive = (targetMode) => mode === targetMode;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 p-10 text-center">
      {/* Dark overlay when in Update/Delete mode */}
      {(mode === 'update' || mode === 'delete') && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10 pointer-events-none" />
      )}

      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/home')}
        className="absolute top-5 right-5 z-30 bg-white text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-100"
      >
        ← Back to Home
      </button>

      <h1 className="text-3xl font-bold text-white mb-10 relative z-20">Manage Database</h1>

      <div className="flex justify-center gap-10 mb-10 relative z-20">
        <div className={mode !== 'none' && mode !== 'add' ? 'opacity-40 pointer-events-none' : ''}>
          <Container
            title="Add"
            icon="➕"
            onClick={() => { resetMode(); setShowAddModal(true); }}
          />
        </div>
        <div className={mode !== 'none' && mode !== 'update' ? 'opacity-40 pointer-events-none' : ''}>
          <Container
            title="Update"
            icon="✏️"
            onClick={() => setMode(isActive('update') ? 'none' : 'update')}
          />
        </div>
        <div className={mode !== 'none' && mode !== 'delete' ? 'opacity-40 pointer-events-none' : ''}>
          <Container
            title="Delete"
            icon="🗑️"
            onClick={() => setMode(isActive('delete') ? 'none' : 'delete')}
          />
        </div>
      </div>

      {/* CSV file list */}
      <div className="bg-white rounded-lg shadow-md max-w-4xl mx-auto p-6 text-left relative z-20">
        <h2 className="text-xl font-semibold mb-4">Available Databases</h2>
        {csvFiles.length === 0 ? (
          <p className="text-gray-500">No CSV files found.</p>
        ) : (
          <ul className="space-y-2">
            {csvFiles.map((file, idx) => (
              <li key={idx} className="flex items-center space-x-3">
                {(mode === 'update' || mode === 'delete') && (
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file)}
                    onChange={() => toggleSelect(file)}
                    className="w-4 h-4"
                  />
                )}
                <span className="text-gray-800">{file.replace('.csv', '')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && <AddModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default Manage;
