import React, { useEffect, useState } from 'react';
import DropDown from './components/DropDown';
import axios from 'axios';
import { FaEllipsisV } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SpinnerOverlay from '../../components/spinningOverlay'; // Updated to support message

const Search = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [databasesByDept, setDatabasesByDept] = useState({});
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [columns, setColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [extraColumns, setExtraColumns] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [loadingDatabases, setLoadingDatabases] = useState(true);
  const [loadingTableData, setLoadingTableData] = useState(false);

  useEffect(() => {
    if (!user || !user.uid) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    setLoadingDatabases(true);
    axios.get(`${API_URL}/api/database/databases`)
      .then(res => {
        const grouped = {};
          res.data.sheets.forEach(db => {
            if (db.database_name === 'Sheet1') return; // ✅ Skip Sheet1
            if (!grouped[db.department_name]) grouped[db.department_name] = [];
            grouped[db.department_name].push(db);
          });
        setDatabasesByDept(grouped);
      })
      .catch(err => console.error('Failed to fetch database list:', err))
      .finally(() => setLoadingDatabases(false));
  }, []);

  const handleSelectDatabase = (db) => {
    setSelectedDatabase(db);
    setPasswordPrompt('');
    setError('');
    setIsUnlocked(false);
  };

  const confirmPassword = () => {
    setLoadingTableData(true);
    axios.post(`${API_URL}/api/database/confirm-password`, {
      sheet_id: selectedDatabase.sheet_id,
      input_password: passwordPrompt,
    })
      .then(() => {
        axios.get(`${API_URL}/api/database/${selectedDatabase.sheet_id}`)
          .then(res => {
            const data = res.data;
            setContracts(data);
            const keys = Object.keys(data[0] || []);
            setColumns(keys);
            setVisibleColumns(keys.slice(0, 3));
            setExtraColumns(keys.slice(3));
            setIsUnlocked(true);
          })
          .catch(err => console.error('Failed to load sheet data', err))
          .finally(() => setLoadingTableData(false));
      })
      .catch(() => {
        setError('Incorrect password. Please try again.');
        setLoadingTableData(false);
      });
  };

  const getFormattedTimestamp = () => {
    const now = new Date();
    return `${now.toISOString().slice(0, 19).replace(/[:T]/g, '-')}`;
  };

  const exportToCSV = (data, headers) => {
    const timestamp = getFormattedTimestamp();
    const filename = `${selectedDatabase.database_name}_${timestamp}.csv`;
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${(row[header] ?? '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (data, headers) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const timestamp = getFormattedTimestamp();
    const filename = `${selectedDatabase.database_name}_${timestamp}.pdf`;
    doc.text(`${selectedDatabase.database_name} Export - ${timestamp}`, 14, 15);
    const tableData = data.map(row =>
      headers.map(h => (row[h] ?? '').toString().slice(0, 100))
    );

    autoTable(doc, {
      startY: 20,
      head: [headers],
      body: tableData,
      styles: { fontSize: 8, overflow: 'linebreak' },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save(filename);
  };

  const getColumnOptions = (col) => {
    return ['All', ...[...new Set(contracts.map(r => r[col] || 'N/A'))]];
  };

  const handleDropdownSelect = (col, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [col]: value
    }));
  };

  const toggleExtraColumn = (col) => {
    setVisibleColumns(prev =>
      prev.includes(col)
        ? prev.filter(c => c !== col)
        : [...prev, col]
    );
  };

  const getFilteredRows = () => {
    const activeDropdowns = Object.entries(activeFilters).filter(([_, val]) => val !== 'All');
    return contracts.filter(row => {
      const matchFilters = activeDropdowns.every(([col, val]) => (row[col] ?? 'N/A') === val);
      const matchSearch = Object.values(row).some(val =>
        (val ?? 'N/A').toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      return activeDropdowns.length ? (matchFilters && matchSearch) : matchSearch;
    });
  };

  const filteredRows = getFilteredRows();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 text-gray-800">
      {loadingDatabases && <SpinnerOverlay message="Loading databases..." />}
      {loadingTableData && <SpinnerOverlay message="Unlocking and loading data..." />}

      <div className="px-4 sm:px-6 md:px-10 py-10 max-w-screen-xl mx-auto w-full">
        <h2 className="text-2xl font-semibold text-white mb-6">Select a Database</h2>
        <button
          onClick={() => navigate('/home')}
          className="absolute top-5 right-5 z-30 bg-white text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-100"
        >
          ← Back to Home
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {Object.entries(databasesByDept).map(([dept, list]) => (
            <div key={dept} className="flex flex-col gap-4">
              <h3 className="text-lg text-white font-semibold">{dept}</h3>
                {list.map(db => {
                  const isCurrent = isUnlocked && selectedDatabase?.id === db.id;
                  return (
                    <div
                      key={db.id}
                      className={`p-4 rounded-xl shadow-md break-words transition-all duration-200 ${
                        isCurrent
                          ? 'bg-blue-600 text-white cursor-not-allowed'
                          : 'bg-white text-gray-800 hover:bg-blue-600 hover:text-white cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!isCurrent) handleSelectDatabase(db);
                      }}
                    >
                      <span className="block break-words whitespace-normal">
                        {db.database_name}
                      </span>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>


        {/* Password Modal */}
        {selectedDatabase && !isUnlocked && !loadingTableData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Enter Password</h3>
              <input
                type="password"
                value={passwordPrompt}
                onChange={(e) => setPasswordPrompt(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              />
              {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
              <div className="flex justify-end space-x-2">
                <button onClick={() => setSelectedDatabase(null)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={confirmPassword} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {isUnlocked && (
          <div className="bg-white shadow-md rounded-xl px-6 py-4 mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                  {selectedDatabase?.database_name} ({filteredRows.length})
                </h2>
              <div className="relative">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  onClick={() => setShowExportOptions(prev => !prev)}
                >
                  Export ▼
                </button>
                {showExportOptions && (
                  <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-20">
                    <button className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                      onClick={() => exportToCSV(filteredRows, columns)}>
                      Export as CSV
                    </button>
                    <button className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                      onClick={() => exportToPDF(filteredRows, columns)}>
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-semibold">Filters</label>
                {extraColumns.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowColumnPicker(!showColumnPicker)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300"
                    >
                      <FaEllipsisV />
                    </button>
                    {showColumnPicker && (
                      <div className="absolute top-12 right-0 bg-white shadow-xl ring-1 ring-black ring-opacity-5 rounded-lg p-4 w-64 z-50">
                        <h4 className="text-sm font-semibold mb-2">Add Filters</h4>
                        <div className="max-h-60 overflow-y-auto">
                          {extraColumns.map((col, i) => (
                            <label key={i} className="block text-sm mb-1">
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={visibleColumns.includes(col)}
                                onChange={() => toggleExtraColumn(col)}
                              />
                              {col}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Search all data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border mb-4"
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {visibleColumns.map((col, idx) => (
                  <div key={`${col}-${idx}`}>
                    <label className="block font-medium">{col}</label>
                    <DropDown
                      label="All"
                      options={getColumnOptions(col)}
                      onSelect={(val) => handleDropdownSelect(col, val)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto max-h-[800px] border rounded-md">
              <table className="table-auto min-w-full text-sm border-collapse">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    {columns.map(col => (
                      <th key={col} className="border px-4 py-2">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {columns.map(col => (
                        <td key={col} className="border px-4 py-2">
                          {(row[col] ?? '').toString().trim() !== '' ? row[col] : <span className="text-gray-400 italic">N/A</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
