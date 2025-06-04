import React, { useEffect, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../auth/authContext';

const ModalForm = ({
  isOpen,
  title,
  fields,
  values,
  onChange,
  onSubmit,
  onClose,
  submitLabel = 'Submit',
}) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const { user: currentUser } = useAuth();

  // Fetch departments only for super_admin
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/super-admin/departments`);
        setDepartments(res.data.departments || []);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    if (isOpen && currentUser?.role === 'super_admin') {
      fetchDepartments();
    }
  }, [isOpen, currentUser?.role]);

  if (!isOpen) return null;

  // Define role options based on current user's role
  const roleOptions =
    currentUser?.role === 'super_admin'
      ? [
          { label: 'Super Admin', value: 'super_admin' },
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ]
      : [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm text-gray-600 mb-1">{field.label}</label>

              {field.name === 'role' ? (
                <select
                  value={values.role}
                  onChange={(e) => onChange('role', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition"
                  required={field.required}
                >
                  <option value="">Select role</option>
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'password' ? (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name={field.name}
                    value={values[field.name] || ''}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={field.required}
                />
              )}
            </div>
          ))}

          {/* Department Dropdown – only for currentUser with role super_admin */}
          {currentUser?.role === 'super_admin' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Department</label>
              <select
                value={values.department || ''}
                onChange={(e) => onChange('department', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition"
                required
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.department_name?.trim()}>
                    {dept.department_name?.trim() || dept.department_id}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
