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
  const [formValues, setFormValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: '',
    department: '',
  });

  

  const formFields = [
    { name: 'first_name', label: 'First Name', required: true },
    { name: 'last_name', label: 'Last Name', required: true },
    { name: 'email', label: 'Email', required: true, type: 'email' },
    { name: 'password', label: 'Password', required: true, type: 'password' },
    { name: 'role', label: 'Role', required: true },
  ];

  const handleChange = (name, value) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    const { first_name, last_name, email, password, role, department } = formValues;

    if (!first_name || !last_name || !email || !password || !role) {
      return setAlert({ message: 'Please fill all required fields.', type: 'error' });
    }

    if (!nameRegex.test(first_name)) {
      return setAlert({ message: 'First name must contain only letters.', type: 'error' });
    }

    if (!nameRegex.test(last_name)) {
      return setAlert({ message: 'Last name must contain only letters.', type: 'error' });
    }

    if (!emailRegex.test(email)) {
      return setAlert({ message: 'Enter a valid email address.', type: 'error' });
    }

    if (!passwordRegex.test(password)) {
      return setAlert({
        message: 'Password must be at least 6 characters with uppercase, number, and special character.',
        type: 'error',
      });
    }

    if (!role || (currentUser?.role === 'super_admin' && !department)) {
      return setAlert({ message: 'Please select a valid role and department.', type: 'error' });
    }

    try {
      const payload = {
        email,
        password,
        first_name,
        last_name,
        role,
        department: currentUser?.role === 'super_admin' ? department : 'N/A',
      };

      await axios.post(`${API_URL}/api/super-admin/user`, payload);

      setAlert({ message: 'User added successfully.', type: 'success' });
      setIsModalOpen(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error submitting user:', error);
      setAlert({ message: 'Failed to add user.', type: 'error' });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/super-admin/users`);
      const data = await res.json();
      const allUsers = data.users || [];

      let filteredUsers = allUsers;

      if (currentUser?.role === 'admin') {
        filteredUsers = allUsers.filter(user =>
          user.role !== 'super_admin' && user.department === currentUser.department
        );
      }

      const current = filteredUsers.find(u => u.uid === currentUser?.uid);
      const others = filteredUsers.filter(u => u.uid !== currentUser?.uid);
      const sortedUsers = current ? [current, ...others] : others;

      setUsers(sortedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Account Management</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          onClick={() => {
            setFormValues({
              first_name: '',
              last_name: '',
              email: '',
              password: '',
              role: '',
              department: '',
            });
            setIsModalOpen(true);
          }}
        >
          Add User
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-700">
            {/* prettier-ignore */}
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-3">First Name</th><th className="px-6 py-3">Last Name</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Department</th><th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                // prettier-ignore
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{user.first_name}</td><td className="px-6 py-4">{user.last_name}</td><td className="px-6 py-4">{user.email}</td><td className="px-6 py-4">{user.role}</td><td className="px-6 py-4">{user.department || '—'}</td><td className="px-6 py-4 text-center space-x-2">
                    {user.uid === currentUser?.uid ? (
                      <span className="text-gray-400 italic">You</span>
                    ) : (
                      <>
                        <button className="text-blue-600 hover:underline">Edit</button>
                        <button className="text-red-600 hover:underline">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {alert.message && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: '', type: '' })}
        />
      )}

      <ModalForm
        isOpen={isModalOpen}
        title="Add New User"
        fields={formFields}
        values={formValues}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
        submitLabel="Add User"
      />
    </div>
  );
};

export default AccountManagement;
