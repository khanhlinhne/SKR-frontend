import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Homepage from '@/features/home/pages/Homepage';
import { OwlLoader } from '@/shared/ui/common';
import './App.css';

const Login = lazy(() => import('@/features/auth/pages/Login'));
const SignUp = lazy(() => import('@/features/auth/pages/SignUp'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const GoogleCallback = lazy(() => import('@/features/auth/pages/GoogleCallback'));
const VerifyEmail = lazy(() => import('@/features/auth/pages/VerifyEmail'));
const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPassword'));

const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Profile = lazy(() => import('@/features/profile/pages/Profile'));
const Flashcards = lazy(() => import('@/features/flashcards/pages/Flashcards'));
const Checkout = lazy(() => import('@/features/checkout/pages/Checkout'));
const Orders = lazy(() => import('@/features/orders/pages/Orders'));
const OrderDetail = lazy(() => import('@/features/orders/pages/OrderDetail'));
const Courses = lazy(() => import('@/features/courses/pages/Courses'));
const PublicCourseDetail = lazy(() => import('@/features/courses/pages/PublicCourseDetail'));
const Learn = lazy(() => import('@/features/learn/pages/Learn'));
const Tests = lazy(() => import('@/features/tests/pages/Tests'));
const TestDetail = lazy(() => import('@/features/tests/pages/TestDetail'));
const QuizTaking = lazy(() => import('@/features/tests/components/QuizTaking'));
const QuizResults = lazy(() => import('@/features/tests/components/QuizResults'));

const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('@/features/admin/pages/AdminUsers'));
const AdminCourses = lazy(() => import('@/features/admin/pages/AdminCourses'));
const AdminCourseDetail = lazy(() => import('@/features/admin/pages/AdminCourseDetail'));
const AdminOrders = lazy(() => import('@/features/admin/pages/AdminOrders'));
const AdminSettings = lazy(() => import('@/features/admin/pages/AdminSettings'));

function RouteLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
            <OwlLoader
                message="Đang tải trang..."
                subMessage="Ứng dụng chỉ tải phần cần cho màn hình hiện tại để mở nhanh hơn."
                className="py-8"
            />
        </div>
    );
}

function App() {
    useEffect(() => {
        const localTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', localTheme);
    }, []);

    return (
        <Suspense fallback={<RouteLoader />}>
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
                <Route path="/courses/:id" element={<PublicCourseDetail />} />
                <Route path="/courses/:id/learn" element={<Learn />} />
                <Route path="/tests" element={<Tests />} />
                <Route path="/tests/:id" element={<TestDetail />} />
                <Route path="/tests/:id/take" element={<QuizTaking />} />
                <Route path="/tests/:id/results" element={<QuizResults />} />

                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
                <Route path="/admin/courses/:id" element={<AdminCourseDetail />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
            </Routes>
        </Suspense>
    );
}

export default App;
