import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Homepage from '@/features/home/pages/Homepage';
import Login from '@/features/auth/pages/Login';
import SignUp from '@/features/auth/pages/SignUp';
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import Dashboard from '@/features/dashboard/pages/Dashboard';
import Profile from '@/features/profile/pages/Profile';
import Flashcards from '@/features/flashcards/pages/Flashcards';
import Checkout from '@/features/checkout/pages/Checkout';
import Orders from '@/features/orders/pages/Orders';
import OrderDetail from '@/features/orders/pages/OrderDetail';
import Courses from '@/features/courses/pages/Courses';
import CourseDetail from '@/features/courses/pages/CourseDetail';
import Learn from '@/features/learn/pages/Learn';
import Tests from '@/features/tests/pages/Tests';
import TestDetail from '@/features/tests/pages/TestDetail';
import { QuizTaking, QuizResults } from '@/features/tests/components';
import GoogleCallback from '@/features/auth/pages/GoogleCallback';
import VerifyEmail from '@/features/auth/pages/VerifyEmail';
import ResetPassword from '@/features/auth/pages/ResetPassword';
import { AdminDashboard, AdminUsers, AdminCourses, AdminCourseDetail, AdminOrders, AdminSettings } from '@/features/admin/pages';
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
      <Route path="/admin/settings" element={<AdminSettings />} />
    </Routes>
  );
}

export default App;