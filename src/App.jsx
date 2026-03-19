import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Homepage from '@/features/home/pages/Homepage';
import { OwlLoader } from '@/shared/ui/common';
import { ProtectedRoute, AdminRoute } from '@/shared/guards';
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
const PublicFlashcards = lazy(() => import('@/features/flashcards/pages/PublicFlashcards'));
const PublicFlashcardDetail = lazy(() => import('@/features/flashcards/pages/PublicFlashcardDetail'));
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

const UnauthorizedRoute = lazy(() => import('@/shared/guards/UnauthorizedRoute'));

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
                {/* ==================== PUBLIC ROUTES ==================== */}
                {/* Không cần đăng nhập */}
                <Route path="/" element={<Homepage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/callback" element={<GoogleCallback />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<PublicCourseDetail />} />
                <Route path="/flashcards/explore" element={<PublicFlashcards />} />
                <Route path="/flashcards/:slug" element={<PublicFlashcardDetail />} />
                <Route path="/unauthorized" element={<UnauthorizedRoute />} />

                {/* ==================== PROTECTED ROUTES ==================== */}
                {/* Yêu cầu đăng nhập */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                <Route path="/courses/:id/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
                <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
                <Route path="/tests/:id" element={<ProtectedRoute><TestDetail /></ProtectedRoute>} />
                <Route path="/tests/:id/take" element={<ProtectedRoute><QuizTaking /></ProtectedRoute>} />
                <Route path="/tests/:id/results" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />

                {/* ==================== ADMIN ROUTES ==================== */}
                {/* Yêu cầu đăng nhập + quyền admin */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
                <Route path="/admin/courses/:id" element={<AdminRoute><AdminCourseDetail /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            </Routes>
        </Suspense>
    );
}

export default App;
