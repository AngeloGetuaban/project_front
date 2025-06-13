import React, { useState, useRef } from 'react';
import axios from 'axios';

const UpdateModal = ({ sheet, onClose, setAlert }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Safely initialize rowData from sheet.columns using lazy initializer
  const [rowData, setRowData] = useState(() =>
    (sheet?.columns || []).reduce((acc, col) => ({ ...acc, [col]: '' }), {})
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);

  const fileInputRef = useRef();

  // ✅ Guard rendering if sheet or its columns are missing
  if (!sheet || !sheet.columns) return null;

  const handleInputChange = (col, value) => {
    setRowData(prev => ({ ...prev, [col]: value }));
  };

  const handleRowSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const values = Object.values(rowData);
    if (values.some(val => !val)) {
      setError('Please fill all column fields.');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/api/database/append-rows`, {
        sheet_id: sheet.sheet_id,
        tab_name: sheet.database_name,
        rows: [values],
      });

      setAlert({ message: 'Row added successfully!', type: 'success' });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to append row.';
      setAlert({ message: msg, type: 'error' });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError('No file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);
    formData.append('sheet_id', sheet.sheet_id);
    formData.append('database_name', sheet.database_name);

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/database/upload-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAlert({ message: 'CSV uploaded successfully!', type: 'success' });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'CSV upload failed.';
      setAlert({ message: msg, type: 'error' });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] max-w-lg max-h-[90vh] rounded-xl shadow-xl overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">Update Sheet</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Department</label>
          <input
            type="text"
            value={sheet.department_name}
            readOnly
            className="w-full px-4 py-2 border rounded bg-gray-100"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Database Name</label>
          <input
            type="text"
            value={sheet.database_name}
            readOnly
            className="w-full px-4 py-2 border rounded bg-gray-100"
          />
        </div>

        {!uploadMode && (
          <form onSubmit={handleRowSubmit}>
            {sheet.columns.map((col, idx) => (
              <div key={idx} className="mb-3">
                <label className="block text-sm font-medium mb-1">{col}</label>
                <input
                  type="text"
                  value={rowData[col]}
                  onChange={(e) => handleInputChange(col, e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                  placeholder={`Enter ${col}`}
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700"
            >
              {loading ? 'Appending...' : 'Add Row'}
            </button>
          </form>
        )}

        {uploadMode && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="w-full px-4 py-2 border rounded mt-4"
            />
            <button
              onClick={handleCsvUpload}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700"
            >
              {loading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              setUploadMode(!uploadMode);
              setError('');
            }}
            className="text-blue-600 hover:underline text-sm"
          >
            {uploadMode ? '← Manual Row Input' : 'Upload via CSV'}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>

        {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default UpdateModal;
