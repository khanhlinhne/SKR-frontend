import * as motion from 'motion/react-client';
import { GraduationCap, BookOpenCheck, ShieldCheck, UserCircle } from 'lucide-react';

export default function AudienceSection() {
    const audiences = [
        {
            icon: GraduationCap,
            title: "Người Học (Học sinh/Sinh viên)",
            description: "Cá nhân hóa lộ trình ôn thi, tự động tạo câu hỏi từ tài liệu và phân tích điểm yếu để bứt phá điểm số.",
            color: "blue",
            features: ["Ôn thi THPT/Đại học", "Lấy chứng chỉ nghề", "Học tập Spaced Repetition"]
        },
        {
            icon: BookOpenCheck,
            title: "Content Creator",
            description: "Xây dựng và quản lý kho học liệu chuyên nghiệp, kiếm thu nhập từ tri thức thông qua gói Premium.",
            color: "violet",
            features: ["Tạo Question Bank", "Phân tích Engagement", "Quản lý bản quyền"]
        },
        {
            icon: ShieldCheck,
            title: "Quản Trị Viên",
            description: "Hệ thống quản lý người dùng, nội dung và doanh thu mạnh mẽ với các chỉ số Business Intelligence AI.",
            color: "emerald",
            features: ["Kiểm duyệt nội dung AI", "Phân tích KPI hệ thống", "Quản lý bảo mật"]
        }
    ];

    return (
        <section className="py-24 bg-base-200/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black text-base-content mb-4 tracking-tight">
                        Dành cho{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent underline decoration-blue-500/30 underline-offset-8">
                            mọi đối tượng
                        </span>
                    </h2>
                    <p className="text-lg text-base-content/60 max-w-2xl mx-auto font-medium">
                        SKR được thiết kế linh hoạt để phục vụ nhu cầu đa dạng từ người học cá nhân đến các chuyên gia sáng tạo nội dung.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {audiences.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-base-100 p-8 rounded-[2rem] border border-base-300 shadow-xl hover:shadow-2xl transition-all group"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                            </div>
                            <h3 className="text-2xl font-black text-base-content mb-4 tracking-tight">{item.title}</h3>
                            <p className="text-base-content/70 mb-6 leading-relaxed font-medium">{item.description}</p>
                            <ul className="space-y-3">
                                {item.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm font-bold text-base-content/50">
                                        <div className={`w-1.5 h-1.5 rounded-full bg-${item.color}-500`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
