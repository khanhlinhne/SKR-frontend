import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { featuredCourses, trustNotes } from '@/features/home/constants';

const accentStyles = {
    blue: 'apple-tone-blue',
    slate: 'apple-tone-slate',
    indigo: 'apple-tone-indigo',
};

export default function ExpertCoursesSection({
    badge = 'Môn học nổi bật',
    titleMain = 'Nội dung được xếp để',
    titleHighlight = 'dễ học, dễ dạy, dễ quay lại',
    subtitle = 'Từ các môn nền tảng đến lộ trình chuyên sâu, SKR giúp người học tiếp cận nội dung có cấu trúc rõ ràng, dễ theo dõi tiến độ và dễ quay lại ôn tập.',
} = {}) {
    return (
        <section id="curriculum" className="px-6 py-20 lg:px-8 lg:py-28">
            <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.82fr_1.18fr]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="lg:sticky lg:top-28 lg:self-start"
                >
                    <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl">
                        {badge}
                    </div>
                    <h2 className="apple-main-text mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                        {titleMain}
                        <br />
                        <span className="apple-highlight-text">{titleHighlight}</span>
                    </h2>
                    <p className="apple-secondary-text mt-6 text-lg leading-8">{subtitle}</p>

                    <div className="mt-10 space-y-4">
                        {trustNotes.map((note, index) => (
                            <motion.div
                                key={note.title}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.45, delay: index * 0.06 }}
                                whileHover={{ y: -4 }}
                                className="apple-panel apple-card-shadow apple-transition rounded-[28px] border p-5 backdrop-blur-xl"
                            >
                                <note.icon className="apple-muted-text h-5 w-5" />
                                <h3 className="apple-main-text mt-4 text-lg font-semibold tracking-[-0.02em]">{note.title}</h3>
                                <p className="apple-secondary-text mt-2 text-sm leading-6">{note.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <div className="space-y-5">
                    {featuredCourses.map((course, index) => (
                        <motion.article
                            key={course.title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -6 }}
                            className={`apple-card-shadow apple-transition overflow-hidden rounded-[32px] border p-7 sm:p-8 ${accentStyles[course.accent]}`}
                        >
                            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                                <div className="max-w-2xl">
                                    <div className="apple-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                                        {course.instructor}
                                    </div>
                                    <h3 className="apple-main-text mt-5 text-3xl font-semibold tracking-[-0.03em]">
                                        {course.title}
                                    </h3>
                                    <p className="apple-secondary-text mt-3 text-base leading-7">{course.subtitle}</p>
                                </div>

                                <div className="apple-panel relative overflow-hidden rounded-[28px] border backdrop-blur-xl">
                                    <motion.img
                                        src={course.image}
                                        alt={`Minh họa cho môn học ${course.title}`}
                                        className="aspect-[16/10] w-full object-cover"
                                        whileHover={{ scale: 1.06 }}
                                        transition={{ duration: 0.45, ease: 'easeOut' }}
                                    />
                                    <div className="apple-img-overlay absolute inset-0" />
                                    <div className="apple-glass-overlay apple-glass-border absolute left-4 top-4 rounded-full border px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xl">
                                        Bộ môn tiêu biểu
                                    </div>
                                    <div className="apple-glass-overlay apple-glass-border absolute bottom-4 left-4 rounded-2xl border px-4 py-3 backdrop-blur-xl">
                                        <p className="text-xs font-medium text-white/72">Học phí</p>
                                        <p className="mt-1 text-lg font-semibold text-white">{course.price}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="apple-border mt-8 flex flex-col gap-6 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap gap-3">
                                    {course.stats.map((item) => (
                                        <span key={item} className="apple-chip rounded-full px-4 py-2 text-sm backdrop-blur-xl">
                                            {item}
                                        </span>
                                    ))}
                                </div>

                                <Link
                                    to="/courses"
                                    className="apple-primary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold hover:-translate-y-px"
                                >
                                    Xem môn học
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
