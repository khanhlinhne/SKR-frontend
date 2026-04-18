import { motion } from 'motion/react';
import { BookOpen, CreditCard, FileText, Play, Sparkles } from 'lucide-react';
import { SUBJECT_COLOR_STYLES } from '@/features/dashboard/constants';

export default function DashboardSubjectsPanel({ subjects, activeTab, onTabChange, variants }) {
    const normalizedSubjects = Array.isArray(subjects) ? subjects : [];
    const filteredSubjects = normalizedSubjects.filter((subject) => activeTab === 'all' || subject.status === activeTab);

    return (
        <motion.div variants={variants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-base-content">Môn học của tôi</h3>
                <div className="flex gap-2">
                    <FilterButton label="Tất cả" isActive={activeTab === 'all'} onClick={() => onTabChange('all')} />
                    <FilterButton label="Đang học" isActive={activeTab === 'active'} onClick={() => onTabChange('active')} />
                    <FilterButton label="Hoàn thành" isActive={activeTab === 'completed'} onClick={() => onTabChange('completed')} />
                </div>
            </div>

            <div className="space-y-3">
                {filteredSubjects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/30 p-6 text-center text-sm font-medium text-base-content/50">
                        Chưa có môn học nào trong nhóm này
                    </div>
                ) : filteredSubjects.map((subject, index) => {
                    const style = SUBJECT_COLOR_STYLES[subject.color] || SUBJECT_COLOR_STYLES.blue;
                    const SubjectIcon = subject.icon || BookOpen;

                    return (
                        <motion.div
                            key={subject.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group cursor-pointer rounded-xl border border-transparent bg-base-200 p-4 transition-all hover:border-blue-500/20 hover:bg-base-300"
                        >
                            <div className="mb-3 flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-base-100 shadow-sm ${style.text}`}>
                                    <SubjectIcon className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="truncate text-sm font-bold text-base-content">{subject.name}</h4>
                                    <div className="mt-1 flex items-center gap-3">
                                        <p className="flex items-center gap-1 text-xs text-base-content/60">
                                            <CreditCard className="h-3 w-3" />
                                            {subject.flashcards} thẻ
                                        </p>
                                        <p className="flex items-center gap-1 text-xs text-base-content/60">
                                            <FileText className="h-3 w-3" />
                                            {subject.tests} bài thi
                                        </p>
                                    </div>
                                </div>
                                <button className="btn btn-circle btn-ghost btn-sm opacity-0 transition-opacity group-hover:opacity-100">
                                    <Play className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 flex-1 rounded-full bg-base-300">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${subject.progress}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                                        className={`${style.bar} h-1.5 rounded-full`}
                                    />
                                </div>
                                <span className="min-w-[3ch] text-xs font-bold text-base-content/60">{subject.progress}%</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="btn btn-outline btn-primary mt-4 w-full rounded-xl font-bold"
            >
                <Sparkles className="h-4 w-4" />
                Thêm môn học mới
            </motion.button>
        </motion.div>
    );
}

function FilterButton({ label, isActive, onClick }) {
    return (
        <button onClick={onClick} className={`btn btn-xs font-bold ${isActive ? 'btn-primary' : 'btn-ghost'}`}>
            {label}
        </button>
    );
}
