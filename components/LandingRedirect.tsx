import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import LandingPage from '../pages/LandingPage';

const LandingRedirect: React.FC = () => {
  const { user } = useAppContext();
  const location = useLocation();

  if (user && location.pathname === '/' && !location.state?.fromLogo) {
    return <Navigate to="/explore" replace />;
  }

  return <LandingPage />;
};

export default LandingRedirect;
