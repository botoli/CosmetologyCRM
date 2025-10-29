// pages/Home.jsx - ПРОСТОЙ РЕДИРЕКТ
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(user ? '/services' : '/login', { replace: true });
  }, [user, navigate]);

  return (
    <div className="app-loading">
      <div className="loading-spinner"></div>
      <p>Перенаправление...</p>
    </div>
  );
};

export default Home;
