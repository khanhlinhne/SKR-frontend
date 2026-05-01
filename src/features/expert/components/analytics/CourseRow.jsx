import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Layers, Pencil, Users } from 'lucide-react';

export default function CourseRow({ course, onViewDetail }) {
    const navigate = useNavigate();
    const chapterCount = course._count?.chapters || course.chaptersCount || 0;
    const lessonCount = course._count?.lessons || course.lessonsCount || 0;
    const studentCount = course._count?.enrollments || course.enrollmentsCount || course.purchaseCount || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="group flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:flex-row sm:items-center"
        >
            <div className="h-32 w-full flex-shrink-0 overflow-hidden rounded-xl sm:h-16 sm:w-20">
                {course.courseBannerUrl ? (
                    <img src={course.courseBannerUrl} alt={course.courseName} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-purple-600/20">
                        <GraduationCap className="h-7 w-7 text-violet-500/40" />
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-black leading-tight text-base-content">{course.courseName}</h3>
                {course.courseCode && <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-600">{course.courseCode}</p>}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <span className="flex items-center gap-1 text-xs text-base-content/50"><Layers className="h-3 w-3 text-violet-500" /><span className="font-bold">{chapterCount}</span> chương</span>
                    <span className="flex items-center gap-1 text-xs text-base-content/50"><BookOpen className="h-3 w-3 text-blue-500" /><span className="font-bold">{lessonCount}</span> bài</span>
                    <span className="flex items-center gap-1 text-xs text-base-content/50"><Users className="h-3 w-3 text-emerald-500" /><span className="font-bold">{studentCount}</span> HV</span>
                </div>
            </div>
            <div className="hidden flex-shrink-0 text-right sm:block">
                {course.priceAmount > 0 ? (
                    <span className="text-sm font-black text-emerald-600">{Number(course.priceAmount).toLocaleString('vi-VN')}đ</span>
                ) : <span className="badge badge-sm badge-ghost font-bold">Miễn phí</span>}
            </div>
            <div className="flex w-full flex-shrink-0 items-center gap-2 sm:w-auto">
                <button
                    onClick={() => onViewDetail(course)}
                    className="group/btn flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 font-bold text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:px-3.5 sm:flex-none sm:gap-0 sm:hover:gap-1.5"
                >
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 sm:max-w-0 sm:group-hover/btn:max-w-[8rem]">DS đăng ký</span>
                </button>
                <button
                    onClick={() => navigate(`/expert/curriculum/${course.courseId || course.id}`)}
                    className="group/btn2 flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:px-3.5 sm:flex-none sm:gap-0 sm:hover:gap-1.5"
                >
                    <Pencil className="h-4 w-4 flex-shrink-0" />
                    <span className="overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 sm:max-w-0 sm:group-hover/btn2:max-w-[8rem]">Nội dung</span>
                </button>
            </div>
        </motion.div>
    );
}
