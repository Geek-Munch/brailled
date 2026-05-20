import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './contexts/AdminContext';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { EvidencePage } from './pages/EvidencePage';
import { AdminPanel } from './components/AdminPanel';
import { StudentPage } from './pages/student';

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/student" element={<StudentPage />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;