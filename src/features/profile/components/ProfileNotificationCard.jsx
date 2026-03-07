import { motion } from 'motion/react';
import { Bell } from 'lucide-react';
import { NOTIFICATION_OPTIONS } from '@/features/profile/constants';

export default function ProfileNotificationCard({ notifications, onToggleNotification, variants }) {
    return (
        <motion.div variants={variants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-base-content">
                <Bell className="h-5 w-5" />
                Thông báo
            </h2>

            <div className="space-y-4">
                {NOTIFICATION_OPTIONS.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-base-200">
                        <div className="flex-1">
                            <p className="text-sm font-bold text-base-content">{setting.label}</p>
                            <p className="text-xs text-base-content/60">{setting.desc}</p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notifications[setting.key]}
                            onChange={(event) => onToggleNotification(setting.key, event.target.checked)}
                        />
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
