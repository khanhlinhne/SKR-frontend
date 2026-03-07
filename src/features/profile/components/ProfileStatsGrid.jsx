import { motion } from 'motion/react';
import { PROFILE_STAT_STYLES, getProfileStats } from '@/features/profile/constants';

export default function ProfileStatsGrid({ userStats, variants }) {
    const stats = getProfileStats(userStats);

    return (
        <div className="max-w-7xl mx-auto px-8 pt-8 mb-8 bg-base-200">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 bg-base-200 py-6 rounded-3xl">
                {stats.map((stat, index) => {
                    const style = PROFILE_STAT_STYLES[stat.color] || PROFILE_STAT_STYLES.blue;
                    return (
                        <motion.div
                            key={index}
                            variants={variants}
                            initial="collapsed"
                            animate="collapsed"
                            whileHover="expanded"
                            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 cursor-pointer overflow-hidden relative group"
                        >
                            <motion.div
                                className="p-4 flex flex-col items-center justify-center"
                                variants={{
                                    collapsed: { height: 'auto', transition: { duration: 0.3 } },
                                    expanded: { height: 'auto', transition: { duration: 0.3 } },
                                }}
                            >
                                <motion.div
                                    className={`w-12 h-12 rounded-xl ${style.softBg} flex items-center justify-center`}
                                    variants={{
                                        collapsed: { scale: 1, marginBottom: 0 },
                                        expanded: { scale: 1.1, marginBottom: 12, transition: { duration: 0.3 } },
                                    }}
                                >
                                    <stat.icon className={`w-6 h-6 ${style.text}`} />
                                </motion.div>

                                <motion.div
                                    className="text-center"
                                    variants={{
                                        collapsed: { opacity: 0, height: 0, transition: { duration: 0.2 } },
                                        expanded: { opacity: 1, height: 'auto', transition: { duration: 0.3, delay: 0.1 } },
                                    }}
                                >
                                    <p className="text-2xl font-black text-base-content mb-1">{stat.value}</p>
                                    <p className="text-xs text-base-content/60 font-bold whitespace-nowrap">{stat.label}</p>
                                </motion.div>
                            </motion.div>

                            <motion.div className={`absolute inset-0 ${style.overlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
