import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './js/firebase';
import { useNavigate } from 'react-router-dom';
import LoginAlert from './components/LoginAlert';
import { useAuth } from '../../auth/authContext';

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
        navigate('/home');
    }
    }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: 'info', message: 'Logging in...' });

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const data = await response.json();

      login(idToken, data.user); // ✅ Store in authContext

      setAlert({ type: 'success', message: 'Login successful!' });
      setTimeout(() => navigate('/home'), 3000);

    } catch (err) {
      let message = 'Login failed.';

      // Firebase Auth error codes
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          message = 'Invalid email or password.';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Check your connection.';
          break;
        default:
          message = err.message || 'Login failed. Please try again.';
      }

      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async () => {
    if (!email) {
      setAlert({ type: 'error', message: 'Please enter your email first.' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setAlert({ type: 'success', message: 'Password reset email sent!' });
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 relative overflow-hidden px-4">
      {alert && (
        <LoginAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="w-full max-w-md bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-300">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Welcome Back</h2>

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-right text-sm mb-6">
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
            className={`w-full text-white py-2.5 rounded-lg font-semibold transition duration-200 shadow-md
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
