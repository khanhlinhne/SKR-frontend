import { motion } from 'motion/react';
import { Brain } from 'lucide-react';

export default function DashboardInsightsPanel({ recentSubject, weakTopics, variants }) {
    return (
        <motion.div variants={variants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300">
            <h3 className="text-lg font-black text-base-content mb-4">Mon Hoc Gan Day</h3>
            <div className="bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-2xl p-4 mb-6 border border-blue-500/10">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {recentSubject.icon}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-base-content text-lg">{recentSubject.name}</h4>
                        <p className="text-sm text-base-content/70">{recentSubject.chapter}</p>
                        <p className="text-xs text-blue-600 font-bold mt-1">{recentSubject.flashcards}</p>
                    </div>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2.5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${recentSubject.progress}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="bg-gradient-to-r from-blue-600 to-violet-600 h-2.5 rounded-full"
                    />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-base-content/60 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        Diem Yeu Can On (AI Analysis)
                    </h4>
                    <div className="badge badge-sm badge-ghost">Premium</div>
                </div>
                <div className="space-y-2">
                    {weakTopics.map((topic, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + index * 0.1 }}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors group cursor-pointer"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-sm font-bold text-base-content truncate">{topic.topic}</h5>
                                    <span className={`badge badge-xs ${topic.priority === 'high' ? 'badge-error' : 'badge-warning'}`}>
                                        {topic.priority === 'high' ? 'Cao' : 'TB'}
                                    </span>
                                </div>
                                <p className="text-xs text-base-content/60">{topic.subject} • Do chinh xac: {topic.accuracy}%</p>
                            </div>
                            <button className="btn btn-xs btn-ghost text-blue-500 opacity-0 group-hover:opacity-100">
                                On ngay
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
