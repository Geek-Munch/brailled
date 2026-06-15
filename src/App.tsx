import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './contexts/AdminContext';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { EvidencePage } from './pages/EvidencePage';
import { AdminPanel } from './components/AdminPanel';
import { GalleryPage } from './pages/GalleryPage';
import { EventDetail } from './pages/EventDetails';
import { EducatorDashboard } from './pages/EducatorDashboard';
import StudentDashboard from './pages/student';

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/educator" element={<EducatorDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;