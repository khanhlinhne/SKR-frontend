import { motion } from 'motion/react';
import { PROFILE_STAT_STYLES, getProfileStats } from '@/features/profile/constants';

export default function ProfileStatsGrid({ userStats, variants }) {
    const stats = getProfileStats(userStats);

    return (
        <div className="mx-auto mb-8 max-w-7xl px-8 pt-2">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                {stats.map((stat) => {
                    const style = PROFILE_STAT_STYLES[stat.color] || PROFILE_STAT_STYLES.blue;

                    return (
                        <motion.div
                            key={stat.label}
                            variants={variants}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-5 shadow-lg"
                        >
                            <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${style.overlay}`} />
                            <div className="relative flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/45">{stat.label}</p>
                                    <p className="mt-3 text-2xl font-black text-base-content">{stat.value}</p>
                                </div>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.softBg}`}>
                                    <stat.icon className={`h-6 w-6 ${style.text}`} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

