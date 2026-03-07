import { motion } from 'motion/react';
import { CreditCard, FileText, Play, Sparkles } from 'lucide-react';
import { SUBJECT_COLOR_STYLES } from '@/features/dashboard/constants';

export default function DashboardSubjectsPanel({ subjects, activeTab, onTabChange, variants }) {
    const filteredSubjects = subjects.filter((subject) => activeTab === 'all' || subject.status === activeTab);

    return (
        <motion.div variants={variants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-base-content">Mon Hoc Cua Toi</h3>
                <div className="flex gap-2">
                    <FilterButton label="Tat ca" isActive={activeTab === 'all'} onClick={() => onTabChange('all')} />
                    <FilterButton label="Dang hoc" isActive={activeTab === 'active'} onClick={() => onTabChange('active')} />
                    <FilterButton label="Hoan thanh" isActive={activeTab === 'completed'} onClick={() => onTabChange('completed')} />
                </div>
            </div>

            <div className="space-y-3">
                {filteredSubjects.map((subject, index) => {
                    const style = SUBJECT_COLOR_STYLES[subject.color] || SUBJECT_COLOR_STYLES.blue;
                    return (
                        <motion.div
                            key={subject.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-base-200 hover:bg-base-300 transition-all group cursor-pointer border border-transparent hover:border-blue-500/20"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-base-100 flex items-center justify-center text-2xl shadow-sm">
                                    {subject.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-base-content truncate">{subject.name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-xs text-base-content/60 flex items-center gap-1">
                                            <CreditCard className="w-3 h-3" />
                                            {subject.flashcards} the
                                        </p>
                                        <p className="text-xs text-base-content/60 flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            {subject.tests} bai thi
                                        </p>
                                    </div>
                                </div>
                                <button className="btn btn-sm btn-circle btn-ghost opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-base-300 rounded-full h-1.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${subject.progress}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                                        className={`${style.bar} h-1.5 rounded-full`}
                                    />
                                </div>
                                <span className="text-xs font-bold text-base-content/60 min-w-[3ch]">{subject.progress}%</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-full mt-4 btn btn-outline btn-primary rounded-xl font-bold"
            >
                <Sparkles className="w-4 h-4" />
                Them Mon Hoc Moi
            </motion.button>
        </motion.div>
    );
}

function FilterButton({ label, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`btn btn-xs font-bold ${isActive ? 'btn-primary' : 'btn-ghost'}`}
        >
            {label}
        </button>
    );
}
