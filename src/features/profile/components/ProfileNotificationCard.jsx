import { motion } from 'motion/react';
import { Bell } from 'lucide-react';
import { NOTIFICATION_OPTIONS } from '@/features/profile/constants';

export default function ProfileNotificationCard({ notifications, onToggleNotification, variants }) {
    return (
        <motion.div
            variants={variants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
        >
            <h2 className="text-xl font-black text-base-content flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5" />
                Thong Bao
            </h2>

            <div className="space-y-4">
                {NOTIFICATION_OPTIONS.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-base-200 transition-colors">
                        <div className="flex-1">
                            <p className="font-bold text-sm text-base-content">{setting.label}</p>
                            <p className="text-xs text-base-content/60">{setting.desc}</p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notifications[setting.key]}
                            onChange={(e) => onToggleNotification(setting.key, e.target.checked)}
                        />
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
