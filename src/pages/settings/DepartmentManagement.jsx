import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalForm from '../../components/ModalForm';
import CustomAlert from '../../components/CustomAlert';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ department_name: '' });
  const [alert, setAlert] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/super-admin/departments`);
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      showAlert('error', 'Failed to load departments');
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

  const handleEdit = (dept) => {
    setIsEditMode(true);
    setEditingDepartmentId(dept.id);
    setNewDepartment({ department_name: dept.department_name });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      await axios.delete(`${API_URL}/api/super-admin/department/${id}`);
      showAlert('success', 'Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      console.error('Delete failed:', error);
      showAlert('error', 'Failed to delete department');
    }
  };

  const handleModalSubmit = async () => {
    const name = newDepartment.department_name.trim();
    if (!name) return;

    setIsSaving(true);

    try {
      if (isEditMode && editingDepartmentId) {
        await axios.put(`${API_URL}/api/super-admin/department/${editingDepartmentId}`, {
          department_name: name,
        });
        showAlert('success', 'Department updated successfully');
      } else {
        await axios.post(`${API_URL}/api/super-admin/department`, {
          department_name: name,
        });
        showAlert('success', 'Department created successfully');
      }

      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingDepartmentId(null);
      setNewDepartment({ department_name: '' });
      fetchDepartments();
    } catch (err) {
      console.error('Failed to save department:', err);
      showAlert('error', err?.response?.data?.message || 'Failed to save department');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Department Management</h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditMode(false);
            setNewDepartment({ department_name: '' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Department
        </button>
      </div>

      {alert && <CustomAlert type={alert.type} message={alert.message} />}

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
                    <button
                      onClick={() => handleEdit(dept)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
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

      <ModalForm
        isOpen={isModalOpen}
        title={isEditMode ? 'Edit Department' : 'Add New Department'}
        fields={[
          {
            name: 'department_name',
            label: 'Department Name',
            type: 'text',
            required: true,
          },
        ]}
        values={newDepartment}
        onChange={(name, value) =>
          setNewDepartment((prev) => ({ ...prev, [name]: value }))
        }
        onSubmit={handleModalSubmit}
        onClose={() => {
          setIsModalOpen(false);
          setNewDepartment({ department_name: '' });
          setIsEditMode(false);
          setEditingDepartmentId(null);
        }}
        submitLabel={isEditMode ? 'Update' : 'Create'}
        isSubmitting={isSaving}
        hideDepartmentDropdown={true}
      />
    </div>
  );
};

export default DepartmentManagement;
