import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import TicketPage from './pages/TicketPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ticket/:id" element={<TicketPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;