import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Flashcards from './pages/Flashcards';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Learn from './pages/Learn';
import Tests from './pages/Tests';
import TestDetail from './pages/TestDetail';
import { QuizTaking, QuizResults } from './components/tests';
import GoogleCallback from './pages/GoogleCallback';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import { AdminDashboard, AdminUsers, AdminCourses, AdminCourseDetail, AdminOrders } from './pages/admin';
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
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/callback" element={<GoogleCallback />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/flashcards" element={<Flashcards />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/courses/:id/learn" element={<Learn />} />
      <Route path="/tests" element={<Tests />} />
      <Route path="/tests/:id" element={<TestDetail />} />
      <Route path="/tests/:id/take" element={<QuizTaking />} />
      <Route path="/tests/:id/results" element={<QuizResults />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/courses" element={<AdminCourses />} />
      <Route path="/admin/courses/:id" element={<AdminCourseDetail />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
    </Routes>
  );
}

export default App;