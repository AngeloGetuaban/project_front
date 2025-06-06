import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/authContext';
import ModalForm from '../../components/ModalForm';
import CustomAlert from '../../components/CustomAlert';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const AccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const [alert, setAlert] = useState({ message: '', type: '' });

  const API_URL = import.meta.env.VITE_API_URL;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: '',
    department: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    new_password: '',
    confirm_password: '',
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const formFields = [
    { name: 'username', label: 'Username', required: true, type: 'text' },
    { name: 'first_name', label: 'First Name', required: true },
    { name: 'last_name', label: 'Last Name', required: true },
    { name: 'email', label: 'Email', required: true, type: 'email' },
    ...(isEditMode ? [] : [{ name: 'password', label: 'Password', required: true, type: 'password' }]),
    { name: 'role', label: 'Role', required: true },
  ];

  const handleChange = (name, value) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (name, value) => {
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z\s]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    const usernameRegex = /^[a-zA-Z0-9_.-]{3,}$/;

    const { username, first_name, last_name, email, password, role, department } = formValues;

    if (!username || !first_name || !last_name || !email || (!isEditMode && !password) || !role) {
      return setAlert({ message: 'All required fields must be filled.', type: 'error' });
    }

    if (!usernameRegex.test(username)) {
      return setAlert({
        message: 'Username must be at least 3 characters and can include letters, numbers, ., _, or -',
        type: 'error',
      });
    }

    if (!nameRegex.test(first_name) || !nameRegex.test(last_name)) {
      return setAlert({ message: 'Names must contain only letters.', type: 'error' });
    }

    if (!emailRegex.test(email)) {
      return setAlert({ message: 'Enter a valid email address.', type: 'error' });
    }

    if (!isEditMode && !passwordRegex.test(password)) {
      return setAlert({
        message: 'Password must be 6+ characters with uppercase, number, and special character.',
        type: 'error',
      });
    }
    console.log(formValues);

    try {
      if (isEditMode) {
        const updatePayload = {
          username,
          first_name,
          last_name,
          email,
          role,
          department,
        };

        await axios.patch(`${API_URL}/api/super-admin/user/${editingUser.uid}`, updatePayload);
        setAlert({ message: 'User updated successfully', type: 'success' });
      } else {
        const createPayload = {
          ...formValues,
          department:
            currentUser?.role === 'super_admin'
              ? department
              : currentUser?.department || 'N/A',
        };
        await axios.post(`${API_URL}/api/super-admin/user`, createPayload);
        setAlert({ message: 'User created successfully', type: 'success' });
      }

      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Submission failed';
      setAlert({ message: msg, type: 'error' });
    }
  };

  const handlePasswordSubmit = async () => {
    const { new_password, confirm_password } = passwordForm;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!new_password || !confirm_password) {
      return setAlert({ message: 'Both password fields are required.', type: 'error' });
    }

    if (new_password !== confirm_password) {
      return setAlert({ message: 'Passwords do not match.', type: 'error' });
    }

    if (!passwordRegex.test(new_password)) {
      return setAlert({
        message: 'Password must include uppercase, number, and special character.',
        type: 'error',
      });
    }

    try {
      await axios.patch(`${API_URL}/api/super-admin/user/${editingUser.uid}/password`, {
        new_password,
      });

      setAlert({ message: 'Password updated successfully', type: 'success' });
      setIsPasswordModalOpen(false);
      setPasswordForm({ new_password: '', confirm_password: '' });
    } catch (err) {
      console.error(err);
      setAlert({ message: 'Failed to update password.', type: 'error' });
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.email}?`)) return;

    try {
      await axios.delete(`${API_URL}/api/super-admin/user/${user.uid}`);
      setAlert({ message: 'User deleted successfully', type: 'success' });
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setAlert({ message: 'Failed to delete user.', type: 'error' });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/super-admin/users`);
      const data = res.data.users || [];

      let list = data;
      if (currentUser?.role === 'admin') {
        list = data.filter(
          u => u.role !== 'super_admin' && u.department === currentUser.department
        );
      }

      const current = list.find(u => u.uid === currentUser.uid);
      const others = list.filter(u => u.uid !== currentUser.uid);
      const sortedOthers = others.sort((a, b) => a.first_name.localeCompare(b.first_name));

      setUsers(current ? [current, ...sortedOthers] : sortedOthers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormValues({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department,
    });
    setIsEditMode(true);
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const openPasswordModal = (user) => {
    setEditingUser(user);
    setPasswordForm({ new_password: '', confirm_password: '' });
    setIsPasswordModalOpen(true);
  };

  useEffect(() => {
    if (currentUser) fetchUsers();
  }, [currentUser]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Account Management</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={() => {
            setFormValues({
              username: '',
              first_name: '',
              last_name: '',
              email: '',
              password: '',
              role: '',
              department: '',
            });
            setIsEditMode(false);
            setIsModalOpen(true);
          }}
        >
          Add User
        </button>
      </div>

      {alert.message && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: '', type: '' })}
        />
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">First Name</th>
                <th className="px-6 py-3">Last Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{u.username}</td>
                  <td className="px-6 py-4">{u.first_name}</td>
                  <td className="px-6 py-4">{u.last_name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.role}</td>
                  <td className="px-6 py-4">{u.department || '—'}</td>
                  <td className="px-6 py-4 text-center space-x-2">
                    {u.uid === currentUser.uid ? (
                      <span className="italic text-gray-400">You</span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(u)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openPasswordModal(u)}
                          className="text-yellow-600 hover:underline"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ModalForm
        isOpen={isModalOpen}
        title={isEditMode ? 'Edit User' : 'Add User'}
        fields={formFields}
        values={formValues}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
        submitLabel={isEditMode ? 'Update' : 'Add User'}
      />

      <ModalForm
        isOpen={isPasswordModalOpen}
        title="Update Password"
        fields={[
          { name: 'new_password', label: 'New Password', required: true, type: 'password' },
          { name: 'confirm_password', label: 'Confirm Password', required: true, type: 'password' },
        ]}
        values={passwordForm}
        onChange={handlePasswordChange}
        onSubmit={handlePasswordSubmit}
        onClose={() => setIsPasswordModalOpen(false)}
        submitLabel="Save Password"
        hideDepartmentDropdown
      />
    </div>
  );
};

export default AccountManagement;
