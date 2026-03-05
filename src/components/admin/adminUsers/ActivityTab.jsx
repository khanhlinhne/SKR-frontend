import * as motion from 'motion/react-client';
import { BookOpen, CheckCircle2, Award, UserPlus, Settings, Clock } from 'lucide-react';

const activityTypeConfig = {
    lesson: { icon: BookOpen, color: 'bg-blue-500' },
    assignment: { icon: CheckCircle2, color: 'bg-emerald-500' },
    certificate: { icon: Award, color: 'bg-amber-500' },
    enroll: { icon: UserPlus, color: 'bg-violet-500' },
    system: { icon: Settings, color: 'bg-red-500' },
    achievement: { icon: Award, color: 'bg-cyan-500' },
};

/**
 * ActivityTab - Tab hoạt động: timeline các hoạt động gần đây.
 */
export default function ActivityTab({ user }) {
    const activities = user.activityLog || [];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activities.length === 0 ? (
                <div className="text-center py-10">
                    <Clock className="w-10 h-10 text-base-content/20 mx-auto mb-3" />
                    <p className="text-sm text-base-content/50 font-bold">Chưa có hoạt động nào</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {activities.map((activity, i) => {
                        const config = activityTypeConfig[activity.type] || activityTypeConfig.system;
                        const ActivityIcon = config.icon;
                        return (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-base-200 transition-colors"
                            >
                                <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                                    <ActivityIcon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-base-content">{activity.action}</p>
                                    <p className="text-xs text-base-content/50 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" /> {activity.time}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
