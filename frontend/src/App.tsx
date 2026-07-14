import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { Register } from './pages/Register';
import DashboardPage from './pages/DashboardPage';
import PretestPage from './pages/PretestPage';
import ModulePage from './pages/ModulePage';
import CalcuMindPage from './pages/CalcuMindPage';
import CalcuSimPage from './pages/CalcuSimPage';
import CalcuQuestPage from './pages/CalcuQuestPage';
import DosenAnalyticsPage from './pages/DosenAnalyticsPage';
import DosenDashboardPage from './pages/DosenDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pretest" element={<PretestPage />} />
        <Route path="/modul" element={<ModulePage />} />
        <Route path="/calcumind" element={<CalcuMindPage />} />
        <Route path="/simulasi" element={<CalcuSimPage />} />
        <Route path="/quest" element={<CalcuQuestPage />} />
        <Route path="/dosen" element={<DosenAnalyticsPage />} />
        <Route path="/dashboard-dosen" element={<DosenDashboardPage />} />
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
