import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from './components/Container';
import NavBar from '../../components/NavBar';
import { useAuth } from '../../auth/authContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 🔒 Redirect if not authenticated
  useEffect(() => {
    if (!user || !user.uid) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSearchClick = () => {
    navigate('/search');
  };

  const handleManageClick = () => {
    navigate('/manage');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600">
      <NavBar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-10">
        <div className="flex space-x-10">
          <Container icon="🔍" title="Search a Database" onClick={handleSearchClick} />
          <Container icon="🗂️" title="Manage Database" onClick={handleManageClick} />
        </div>
      </div>
    </div>
  );
};

export default Home;
