import ExpertSidebar from './ExpertSidebar';
import ExpertHeader from './ExpertHeader';

/**
 * ExpertLayout - Shared layout wrapper for all expert pages
 * Provides consistent sidebar + header structure
 *
 * @param {React.ReactNode} children - Page content
 */
export default function ExpertLayout({ children }) {
    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Sidebar */}
            <ExpertSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <ExpertHeader />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
