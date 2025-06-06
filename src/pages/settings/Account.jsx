import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/authContext';
import { useNavigate } from 'react-router-dom';
import CustomAlert from '../../components/CustomAlert';

const Account = () => {
  const [isSaving, setIsSaving] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const isRestricted = ['user'].includes(user?.role);
  const editableFields = ['first_name', 'last_name', 'email', 'password'];
  const [editField, setEditField] = useState(null);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (!user || !user.uid) {
      navigate('/');
    }
  }, [user, navigate]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/.test(password);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    setIsSaving(true);
    try {
      if (field === 'password') {
        const { current_password, new_password, confirm_password } = formData;

        if (!current_password || !new_password || !confirm_password) {
          showAlert('error', 'Please fill in all password fields.');
          return;
        }

        if (new_password !== confirm_password) {
          showAlert('error', 'New passwords do not match.');
          return;
        }

        if (!validatePassword(new_password)) {
          showAlert('error', 'Password must be 6+ characters with uppercase, number, and special character.');
          return;
        }

        await axios.patch(`${API_URL}/api/account/user/${user.uid}/password`, {
          current_password,
          new_password,
        });

        showAlert('success', 'Password updated successfully!');
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: '',
        }));
      } else {
        if (field === 'email' && !validateEmail(formData.email)) {
          showAlert('error', 'Invalid email address.');
          return;
        }

        const res = await axios.patch(`${API_URL}/api/account/user/${user.uid}`, {
          [field]: formData[field],
        });

        updateUser(res.data.updatedUser);
        showAlert('success', `${field.replace('_', ' ')} updated!`);
      }

      setEditField(null);
    } catch (err) {
      console.error('Update failed:', err);
      showAlert('error', err?.response?.data?.message || 'Failed to update. Try again.');
    }finally {
    setIsSaving(false); // ✅ Always reset
  }
};

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setEditField(null);
  };

  const fields = [
    { key: 'username', label: 'Username', editable: !isRestricted },
    { key: 'first_name', label: 'First Name', editable: !isRestricted },
    { key: 'last_name', label: 'Last Name', editable: !isRestricted },
    { key: 'email', label: 'Email', editable: !isRestricted },
    { key: 'password', label: 'Password', editable: true },
    { key: 'role', label: 'Role', editable: false },
    { key: 'department', label: 'Department', editable: false }
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Account Settings</h2>

      {alert && (
        <CustomAlert type={alert.type} message={alert.message} />
      )}

      <div className="space-y-5">
        {fields.map(({ key, label, editable }) => (
          <div
            key={key}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5 flex flex-col"
          >
            <div className="flex justify-between items-center">
              <div className="w-full">
                <p className="text-sm text-gray-500">{label}</p>

                {editField === key && editable ? (
                  key === 'password' ? (
                    <div className="space-y-3 mt-2">
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={formData.current_password}
                        onChange={(e) => handleInputChange('current_password', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        value={formData.new_password}
                        onChange={(e) => handleInputChange('new_password', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.confirm_password}
                        onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )
                ) : (
                  <p className="text-base font-medium text-gray-800 mt-1">
                    {key === 'password' ? '********' : user?.[key] || '-'}
                  </p>
                )}
              </div>

              {editable && (
                <div className="ml-4 whitespace-nowrap mt-3 sm:mt-0">
                  {editField === key ? (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSave(key)}
                        className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-sm px-3 py-1 border border-gray-400 rounded-md hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditField(key)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition"
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Account;
