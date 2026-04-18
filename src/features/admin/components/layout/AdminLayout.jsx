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
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <AdminHeader />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
