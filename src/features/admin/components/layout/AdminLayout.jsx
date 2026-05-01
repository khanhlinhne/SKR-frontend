import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

/**
 * AdminLayout - Shared layout wrapper for all admin pages
 * Provides consistent sidebar + header structure
 * 
 * @param {React.ReactNode} children - Page content 
 */
export default function AdminLayout({ children }) {
    return (
        <div className="flex h-dvh overflow-hidden bg-base-200">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {/* Header */}
                <AdminHeader />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 sm:px-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
