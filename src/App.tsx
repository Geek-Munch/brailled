import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AdminProvider } from './contexts/AdminContext';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { EvidencePage } from './pages/EvidencePage';
import { AdminPanel } from './components/AdminPanel';
import { EducatorDashboard } from './pages/EducatorDashboard';
import StudentDashboard from './pages/student';

// Create a component to handle keyboard shortcuts globally
const KeyboardShortcuts: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+S (or Cmd+Shift+S on Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault(); // Prevent browser's save as dialog
        console.log('🔑 Ctrl+Shift+S pressed - Navigating to Student Page');
        navigate('/student');
      }
      
      // Optional: Add more shortcuts
      // Ctrl+Shift+E for Educator page
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        navigate('/educator');
      }
      
      // Ctrl+Shift+A for Admin page
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        navigate('/admin');
      }
      
      // Ctrl+Shift+H for Home/Landing page
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'H') {
        event.preventDefault();
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <BrowserRouter>
          <KeyboardShortcuts /> {/* Add keyboard shortcut handler */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/educator" element={<EducatorDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;