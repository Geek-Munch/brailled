import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './contexts/AdminContext';
import { LandingPage } from './pages/LandingPage';
import { EvidencePage } from './pages/EvidencePage';
import { AdminPanel } from './components/AdminPanel';
import { StudentPage } from './pages/student';

function App() {
  return (
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
  );
}

export default App;