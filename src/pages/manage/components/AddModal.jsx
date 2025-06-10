import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/authContext';

const AddModal = ({ onClose, onCreated }) => {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [title, setTitle] = useState('');
  const [columns, setColumns] = useState(['']);
  const [databasePassword, setDatabasePassword] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createdBy = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

  useEffect(() => {
    axios.get(`${API_URL}/api/super-admin/departments`)
      .then(res => setDepartments(res.data.departments || []))
      .catch(err => {
        console.error('Failed to fetch departments', err);
        setError('Failed to load departments.');
      });
  }, []);

  const handleAddColumn = () => {
    setColumns([...columns, '']);
  };

  const handleChangeColumn = (index, value) => {
    const newCols = [...columns];
    newCols[index] = value;
    setColumns(newCols);
  };

  const handleRemoveColumn = (index) => {
    const newCols = [...columns];
    newCols.splice(index, 1);
    setColumns(newCols);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !databasePassword || !departmentName || !createdBy) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/database/databases`, {
        database_name: title,
        department_name: departmentName,
        created_by: createdBy,
        database_password: databasePassword,
        columns,
      });

      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create sheet.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] max-w-lg h-[580px] rounded-xl shadow-xl relative overflow-hidden">
        <div className="p-6 overflow-y-auto h-full">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Create New Google Sheet
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Database Title */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Database Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Database Password */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Database Password</label>
              <input
                type="password"
                value={databasePassword}
                onChange={e => setDatabasePassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Department</label>
              <select
                value={departmentName}
                onChange={e => setDepartmentName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Select a department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.department_name}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Created By */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Created By</label>
              <input
                type="text"
                value={createdBy}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            {/* Dynamic Columns */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Columns</label>
              {columns.map((col, idx) => (
                <div key={idx} className="flex items-center mb-2 gap-2">
                  <input
                    type="text"
                    value={col}
                    onChange={e => handleChangeColumn(idx, e.target.value)}
                    placeholder={`Column ${idx + 1}`}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {columns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(idx)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg px-2"
                      title="Remove column"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddColumn}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add another column
              </button>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            {/* Actions */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
