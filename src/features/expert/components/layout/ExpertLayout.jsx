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
        <div className="flex h-dvh overflow-hidden bg-base-200">
            {/* Sidebar */}
            <ExpertSidebar />

            {/* Main Content Area */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {/* Header */}
                <ExpertHeader />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 sm:px-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
