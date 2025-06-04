import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';


const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/super-admin/departments`);
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';

    const seconds = timestamp._seconds || timestamp.seconds;
    if (!seconds) return 'N/A';

    const date = new Date(seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Department Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Add Department
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-3">Department Name</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{dept.department_name?.trim()}</td>
                  <td className="px-6 py-4">{formatTimestamp(dept.created_at)}</td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button className="text-blue-600 hover:underline">Edit</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-400">
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
