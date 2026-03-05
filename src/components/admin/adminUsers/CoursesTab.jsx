import * as motion from 'motion/react-client';
import { BookOpen } from 'lucide-react';

/**
 * CoursesTab - Tab khóa học: danh sách khóa đã đăng ký với progress bar.
 */
export default function CoursesTab({ user }) {
    const courses = user.enrolledCourses || [];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-3">
            {courses.length === 0 ? (
                <div className="text-center py-10">
                    <BookOpen className="w-10 h-10 text-base-content/20 mx-auto mb-3" />
                    <p className="text-sm text-base-content/50 font-bold">Chưa đăng ký khóa học nào</p>
                </div>
            ) : (
                courses.map((course, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-base-200 border border-base-300 hover:shadow-sm transition-shadow"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-sm font-bold text-base-content truncate">{course.name}</p>
                                <span className={`badge badge-xs font-bold flex-shrink-0 ml-2 ${course.status === 'completed' ? 'badge-success' : 'badge-info'}`}>
                                    {course.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <progress className={`progress progress-sm flex-1 ${course.progress === 100 ? 'progress-success' : 'progress-info'}`} value={course.progress} max="100" />
                                <span className="text-xs font-bold text-base-content/60 w-10 text-right">{course.progress}%</span>
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </motion.div>
    );
}
