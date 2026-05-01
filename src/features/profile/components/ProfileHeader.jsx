import { motion } from 'motion/react';
import { Search, Bell } from 'lucide-react';

export default function ProfileHeader() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="border-b border-base-300 bg-base-100 px-4 py-4 sm:px-6 lg:px-8"
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <h2 className="text-xl font-black text-base-content sm:text-2xl">Hồ sơ cá nhân</h2>
                    <p className="text-sm font-medium text-base-content/60">Quản lý thông tin và cài đặt tài khoản</p>
                </div>

                <div className="flex min-w-0 items-center gap-3 lg:gap-4">
                    <div className="relative min-w-0 flex-1 lg:flex-none">
                        <input
                            type="text"
                            placeholder="Tìm kiếm cài đặt..."
                            className="input input-bordered w-full rounded-full border-base-300 bg-base-200 pl-10 focus:border-blue-500 sm:w-72 lg:w-80"
                        />
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40" />
                    </div>

                    <div className="indicator">
                        <span className="indicator-item badge badge-primary badge-sm">3</span>
                        <button className="btn btn-circle btn-ghost">
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
