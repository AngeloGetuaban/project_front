import React, { useEffect, useState } from 'react';
import DropDown from './components/DropDown';
import axios from 'axios';
import { FaEllipsisV } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Search = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState({});
  const [contractsList, setContractsList] = useState([]);
  const [selectedContract, setSelectedContract] = useState('');
  const [columns, setColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [extraColumns, setExtraColumns] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    if (!user || !user.uid) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    axios.get(`http://${API_URL}/api/csv/contracts`)
      .then(res => {
        setContracts(res.data);
        setContractsList(Object.keys(res.data));
      })
      .catch(err => console.error('Error fetching contracts:', err));
  }, []);

  useEffect(() => {
    if (selectedContract && contracts[selectedContract]?.length > 0) {
      const sample = contracts[selectedContract][0];
      const keys = Object.keys(sample);
      setColumns(keys);
      setVisibleColumns(keys.slice(0, 3));
      setExtraColumns(keys.slice(3));
      setActiveFilters({});
      setSearchTerm('');
    }
  }, [selectedContract]);

  const toggleExtraColumn = (col) => {
    if (visibleColumns.includes(col)) {
      setVisibleColumns(visibleColumns.filter(c => c !== col));
    } else {
      setVisibleColumns([...visibleColumns, col]);
    }
  };

  const getFormattedTimestamp = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');

    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    return `${date}_${time}`;
  };

  const getColumnOptions = (col) => {
    const rows = contracts[selectedContract];
    const values = new Set();
    rows.forEach(row => values.add(row[col]));
    return ['All', ...Array.from(values)];
  };

  const handleDropdownSelect = (col, value) => {
    setActiveFilters({ ...activeFilters, [col]: value });
  };

  const getFilteredRows = () => {
    if (!selectedContract) return [];
    const rows = contracts[selectedContract];
    const activeDropdowns = Object.entries(activeFilters).filter(([_, val]) => val !== 'All');

    return rows.filter(row => {
      const matchesDropdowns = activeDropdowns.every(([col, val]) => row[col] === val);
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = Object.values(row).some(val =>
        val?.toString().toLowerCase().includes(searchLower)
      );
      if (activeDropdowns.length === 0) return matchesSearch;
      return matchesDropdowns && matchesSearch;
    });
  };

const exportToCSV = (data, headers) => {
  const timestamp = getFormattedTimestamp();
  const filename = `${selectedContract.replace('.csv', '')}_${timestamp}.csv`;

  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => `"${(row[header] ?? '').toString().replace(/"/g, '""')}"`).join(',')
    ),
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
    const name = selectedContract.replace('.csv', '');
    const filename = `${name}_${timestamp}.pdf`;

    const titleText = `${name} - Export on ${timestamp.replace(/_/g, ' ')}`;

    // Truncate to avoid giant cell heights
    const truncate = (text, max = 100) =>
      typeof text === 'string' && text.length > max ? text.slice(0, max) + '…' : (text ?? '');

    const tableData = data.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return truncate(JSON.stringify(val));
        return truncate(val.toString());
      })
    );

    // Draw title
    doc.setFontSize(10);
    doc.text(titleText, 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [headers],
      body: tableData,
      styles: {
        fontSize: 8,
        overflow: 'linebreak',
        cellPadding: 2,
        valign: 'top',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      theme: 'striped',
      pageBreak: 'auto',
      tableWidth: 'wrap',               // Let table naturally span multiple pages
      horizontalPageBreak: true,        // ✅ Move extra columns to next page
      horizontalPageBreakRepeat: 1,     // ✅ Repeat the first column (adjust as needed)
    });

    doc.save(filename);
  };

  const filteredRows = getFilteredRows();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 text-gray-800">
      <div className="p-10">
        {/* Contract Selection */}
        <div className="mb-10 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Select a Contract</h2>
            <button
              onClick={() => navigate('/home')}
              className="absolute top-5 right-5 z-30 bg-white text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-100"
            >
              ← Back to Home
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {contractsList.map((filename) => (
              <div
                key={filename}
                className={`cursor-pointer p-4 rounded-xl shadow-md text-center text-sm font-medium 
                ${selectedContract === filename ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}
                hover:bg-blue-500 hover:text-white transition`}
                onClick={() => setSelectedContract(filename)}
              >
                {filename.replace('.csv', '')}
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        {selectedContract && (
          <div className="bg-white shadow-md rounded-xl p-6 mb-10 max-w-6xl mx-auto relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Search Filters</h2>

              {extraColumns.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowColumnPicker(!showColumnPicker)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300"
                  >
                    <FaEllipsisV />
                  </button>

                  {showColumnPicker && (
                    <div className="absolute top-12 z-50 right-0 bg-white shadow-xl ring-1 ring-black ring-opacity-5 rounded-lg p-4 w-64">
                      <h4 className="text-sm font-semibold mb-2">Add Filters</h4>
                      <div className="max-h-60 z-50 overflow-y-auto">
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
              <div className="md:col-span-4">
                <label className="block mb-2 font-medium">Search Input</label>
                <input
                  type="text"
                  placeholder="Type to search all data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {visibleColumns.map((col, idx) => (
                <div key={`${col}-${idx}`}>
                  <label className="block mb-2 font-medium">{col}</label>
                  <DropDown
                    label="All"
                    options={getColumnOptions(col)}
                    onSelect={(val) => handleDropdownSelect(col, val)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {selectedContract && (
          <div className="bg-white shadow-md rounded-xl px-6 py-4 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Results ({filteredRows.length})</h2>
              <div className="relative">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={() => setShowExportOptions(prev => !prev)}
                >
                  Export ▼
                </button>
                {showExportOptions && (
                  <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-20">
                    <button
                      className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                      onClick={() => exportToCSV(filteredRows, columns)}
                    >
                      Export as CSV
                    </button>
                    <button
                      className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                      onClick={() => exportToPDF(filteredRows, columns)}
                    >
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-scroll overflow-y-scroll h-[500px] border rounded-md scrollbars-always">
              {filteredRows.length === 0 ? (
                <p className="text-gray-500 p-4">No results found for selected filters.</p>
              ) : (
                <table className="min-w-[1200px] table-fixed border-collapse border border-gray-300 text-sm">
                  <thead className="bg-gray-100 text-left sticky top-0 z-10">
                    <tr>
                      {columns.map((col, idx) => (
                        <th
                          key={idx}
                          className="border px-4 py-3 font-medium text-gray-700 whitespace-nowrap bg-gray-100"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        {columns.map((col, colIdx) => (
                          <td
                            key={colIdx}
                            className="border px-4 py-3 whitespace-nowrap text-gray-800"
                          >
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
