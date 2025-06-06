import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './js/firebase';
import { useNavigate } from 'react-router-dom';
import LoginAlert from './components/LoginAlert';
import { useAuth } from '../../auth/authContext';

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const { user, login } = useAuth();
  const [input, setInput] = useState(''); // username or email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const showAlert = (type, message) => setAlert({ type, message });

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (typeof storedUser !== 'object' || storedUser === null) {
        localStorage.removeItem('user');
      }
    } catch {
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    if (user) navigate('/home');
  }, [user, navigate]);

  const resolveEmail = async (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(input)) return input;

    const res = await fetch(`${API_URL}/api/auth/resolve-username?input=${input}`);
    if (!res.ok) throw new Error('Username not found');
    const data = await res.json();
    return data.email;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    showAlert('info', 'Logging in...');

    try {
      const resolvedEmail = await resolveEmail(input);
      if (!resolvedEmail || typeof resolvedEmail !== 'string') {
        throw new Error('No matching email found for this username.');
      }

      console.log("Resolved email:", resolvedEmail); // Debug logging

      const userCred = await signInWithEmailAndPassword(auth, resolvedEmail, password);
      const idToken = await userCred.user.getIdToken();

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const data = await response.json();
      login(idToken, data.user);

      showAlert('success', 'Login successful!');
      setTimeout(() => navigate('/home'), 2000);
    } catch (err) {
      const code = err?.code;
      const errorMessages = {
        'auth/user-not-found': 'Invalid email/username or password.',
        'auth/invalid-credential': 'Invalid email/username or password.',
        'auth/invalid-email': 'Invalid email format.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/network-request-failed': 'Network error. Check your connection.',
      };

      showAlert('error', errorMessages[code] || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!input) {
      showAlert('error', 'Please enter your email or username first.');
      return;
    }

    if (resetSent) {
      showAlert('info', 'Please wait a few moments before retrying.');
      return;
    }

    try {
      const resolvedEmail = await resolveEmail(input);
      await sendPasswordResetEmail(auth, resolvedEmail);
      showAlert('success', 'Password reset email sent!');
      setResetSent(true);
      setTimeout(() => setResetSent(false), 30000);
    } catch (err) {
      showAlert('error', err.message || 'Could not send password reset email.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 px-4 relative overflow-hidden">
      {alert && (
        <LoginAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="w-full max-w-md bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-300">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Welcome Back</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email or Username
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute top-2.5 right-3 text-sm text-gray-600 hover:text-gray-800"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="text-right text-sm">
            <button
              type="button"
              className="text-blue-600 hover:underline focus:outline-none"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2.5 rounded-lg font-semibold transition duration-200 shadow-md ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
