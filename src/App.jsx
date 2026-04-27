import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize theme from local storage
    const localTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", localTheme);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<ErrorBoundary><SignUp /></ErrorBoundary>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;