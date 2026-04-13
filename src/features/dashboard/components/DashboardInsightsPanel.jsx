import { motion } from 'motion/react';
import { BookOpen, Brain } from 'lucide-react';

export default function DashboardInsightsPanel({ recentSubject, weakTopics, variants }) {
    const RecentSubjectIcon = recentSubject?.icon || BookOpen;
    const normalizedWeakTopics = Array.isArray(weakTopics) ? weakTopics : [];

    return (
        <motion.div variants={variants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-black text-base-content">Môn học gần đây</h3>
            <div className="mb-6 rounded-2xl border border-blue-500/10 bg-gradient-to-br from-blue-500/5 to-violet-500/5 p-4">
                {recentSubject ? (
                    <>
                        <div className="mb-3 flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg">
                                <RecentSubjectIcon className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-base-content">{recentSubject.name}</h4>
                                <p className="text-sm text-base-content/70">{recentSubject.chapter}</p>
                                <p className="mt-1 text-xs font-bold text-blue-600">{recentSubject.flashcards}</p>
                            </div>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-base-300">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${recentSubject.progress}%` }}
                                transition={{ duration: 1, delay: 0.8 }}
                                className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600"
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-100/60 px-4 text-center text-sm font-medium text-base-content/50">
                        Chưa có môn học gần đây để hiển thị
                    </div>
                )}
            </div>

            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-base-content/60">
                        <Brain className="h-4 w-4 text-purple-500" />
                        Điểm yếu cần ôn (AI Analysis)
                    </h4>
                    <div className="badge badge-ghost badge-sm">Premium</div>
                </div>
                <div className="space-y-2">
                    {normalizedWeakTopics.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-base-300 bg-base-200/30 p-4 text-sm font-medium text-base-content/50">
                            Chưa có dữ liệu điểm yếu cần ôn.
                        </div>
                    ) : normalizedWeakTopics.map((topic, index) => (
                        <motion.div
                            key={topic.id || topic.topic}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + index * 0.1 }}
                            className="group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-base-200"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h5 className="truncate text-sm font-bold text-base-content">{topic.topic}</h5>
                                    <span className={`badge badge-xs ${topic.priority === 'high' ? 'badge-error' : 'badge-warning'}`}>
                                        {topic.priority === 'high' ? 'Cao' : 'TB'}
                                    </span>
                                </div>
                                <p className="text-xs text-base-content/60">
                                    {topic.subject} • Độ chính xác: {topic.accuracy}%
                                </p>
                            </div>
                            <button className="btn btn-xs btn-ghost text-blue-500 opacity-0 group-hover:opacity-100">
                                Ôn ngay
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
