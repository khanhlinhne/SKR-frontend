import { useState } from 'react';
import { motion } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import {
    UserCircle,
    Camera,
    Save,
    Star,
    BookOpen,
    Users,
    Award,
    Globe,
    Mail,
    Phone,
    MapPin,
    Link as LinkIcon,
    Linkedin,
    Github,
    Twitter,
    Plus,
    Trash2,
    Edit3,
    Eye,
    Shield,
    CheckCircle2,
    TrendingUp,
    ExternalLink,
} from 'lucide-react';

// ===== ANIMATION =====
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ===== MOCK DATA =====
const expertData = {
    name: 'Nguyễn Trí Dũng',
    title: 'Senior Software Engineer & Instructor',
    email: 'dungnt@email.com',
    phone: '0912 345 678',
    location: 'Hồ Chí Minh, Việt Nam',
    bio: 'Kỹ sư phần mềm với 8 năm kinh nghiệm trong lĩnh vực Web Development. Đam mê chia sẻ kiến thức và giúp đỡ lập trình viên mới. Chuyên gia về React, Next.js, Node.js và Cloud Architecture.',
    website: 'https://tridung.dev',
    linkedin: 'linkedin.com/in/tridung',
    github: 'github.com/tridung',
    avatar: 'https://i.pravatar.cc/150?img=32',
};

const profileStats = [
    { label: 'Khóa học', value: '12', icon: BookOpen, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Học viên', value: '1,284', icon: Users, gradient: 'from-blue-500 to-cyan-600' },
    { label: 'Đánh giá TB', value: '4.82', icon: Star, gradient: 'from-amber-500 to-orange-600' },
    { label: 'Chứng chỉ', value: '6', icon: Award, gradient: 'from-emerald-500 to-teal-600' },
];

const certificates = [
    { id: 1, name: 'AWS Solutions Architect – Associate', issuer: 'Amazon Web Services', year: '2025', verified: true },
    { id: 2, name: 'Meta Front-End Developer Certificate', issuer: 'Meta (Coursera)', year: '2024', verified: true },
    { id: 3, name: 'Google UX Design Certificate', issuer: 'Google (Coursera)', year: '2024', verified: true },
    { id: 4, name: 'MongoDB Associate Developer', issuer: 'MongoDB University', year: '2023', verified: true },
    { id: 5, name: 'React Advanced Patterns', issuer: 'Frontend Masters', year: '2023', verified: false },
    { id: 6, name: 'Node.js Application Developer', issuer: 'OpenJS Foundation', year: '2022', verified: true },
];

const topReviews = [
    { id: 1, student: 'Trần Minh Khoa', avatar: 'https://i.pravatar.cc/150?img=3', rating: 5, course: 'React Masterclass', text: 'Khóa học tuyệt vời! Giảng viên giải thích rất dễ hiểu, có nhiều ví dụ thực tế.', date: '15/03/2026' },
    { id: 2, student: 'Lê Thị Hồng', avatar: 'https://i.pravatar.cc/150?img=5', rating: 5, course: 'Python Data Science', text: 'Nội dung rất chất lượng, cập nhật theo xu hướng mới nhất. Highly recommended!', date: '10/03/2026' },
    { id: 3, student: 'Nguyễn Văn Bình', avatar: 'https://i.pravatar.cc/150?img=8', rating: 4, course: 'UI/UX Design', text: 'Kiến thức nền tảng rất tốt, cần thêm phần thực hành dự án thực tế.', date: '05/03/2026' },
];

// ===== MAIN COMPONENT =====
export default function ExpertProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(expertData);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content flex items-center gap-3">
                            <UserCircle className="w-8 h-8 text-violet-500" />
                            Hồ sơ Chuyên gia
                        </h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Tùy chỉnh trang cá nhân và xây dựng thương hiệu
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <Eye className="w-4 h-4" />
                            Xem trang công khai
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`btn btn-sm rounded-xl font-bold gap-1.5 ${isEditing
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none shadow-lg'
                                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none shadow-lg shadow-violet-500/25'
                            }`}
                        >
                            {isEditing ? <><Save className="w-4 h-4" /> Lưu thay đổi</> : <><Edit3 className="w-4 h-4" /> Chỉnh sửa</>}
                        </button>
                    </div>
                </motion.div>

                {/* Profile Header Card */}
                <motion.div variants={cardVariants} className="bg-base-100 rounded-3xl shadow-lg border border-base-300 overflow-hidden mb-6">
                    {/* Cover */}
                    <div className="h-40 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 relative">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
                    </div>

                    {/* Profile Info */}
                    <div className="px-6 pb-6 -mt-16 relative">
                        <div className="flex flex-wrap items-end gap-5">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-2xl ring-4 ring-base-100 overflow-hidden shadow-xl">
                                    <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
                                </div>
                                {isEditing && (
                                    <button className="absolute inset-0 w-28 h-28 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </button>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 pt-4">
                                {isEditing ? (
                                    <div className="space-y-2 max-w-md">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="input input-bordered w-full font-black text-xl rounded-xl"
                                        />
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            className="input input-bordered input-sm w-full rounded-xl"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-black text-base-content">{formData.name}</h2>
                                            <CheckCircle2 className="w-5 h-5 text-violet-500" />
                                        </div>
                                        <p className="text-sm text-base-content/60 font-medium">{formData.title}</p>
                                    </>
                                )}
                            </div>

                            {/* Stats Badges */}
                            <div className="flex gap-3">
                                {profileStats.map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md mb-1`}>
                                            <stat.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="text-lg font-black text-base-content leading-tight">{stat.value}</p>
                                        <p className="text-[9px] font-bold text-base-content/50 uppercase">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Bio + Contact */}
                    <div className="space-y-6">
                        {/* Bio */}
                        <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
                            <h3 className="font-black text-base-content mb-3">Giới thiệu</h3>
                            {isEditing ? (
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    rows={5}
                                    className="textarea textarea-bordered w-full rounded-xl text-sm resize-none"
                                />
                            ) : (
                                <p className="text-sm text-base-content/70 leading-relaxed">{formData.bio}</p>
                            )}
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
                            <h3 className="font-black text-base-content mb-4">Thông tin Liên hệ</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: Mail, label: 'Email', field: 'email' },
                                    { icon: Phone, label: 'Điện thoại', field: 'phone' },
                                    { icon: MapPin, label: 'Địa điểm', field: 'location' },
                                    { icon: Globe, label: 'Website', field: 'website' },
                                ].map(item => (
                                    <div key={item.field} className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4 text-base-content/40 flex-shrink-0" />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData[item.field]}
                                                onChange={(e) => handleInputChange(item.field, e.target.value)}
                                                className="input input-bordered input-sm flex-1 rounded-lg text-sm"
                                                placeholder={item.label}
                                            />
                                        ) : (
                                            <span className="text-sm text-base-content/70">{formData[item.field]}</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Social Links */}
                            <div className="mt-4 pt-4 border-t border-base-300">
                                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-3">Social</p>
                                <div className="flex gap-2">
                                    {[
                                        { icon: Linkedin, color: 'hover:text-blue-600 hover:bg-blue-500/10' },
                                        { icon: Github, color: 'hover:text-gray-800 hover:bg-gray-500/10' },
                                        { icon: Twitter, color: 'hover:text-sky-500 hover:bg-sky-500/10' },
                                    ].map((social, i) => (
                                        <button key={i} className={`w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-base-content/50 transition-all ${social.color}`}>
                                            <social.icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Certificates + Reviews */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Certificates */}
                        <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-500" />
                                    <h3 className="text-lg font-black text-base-content">Chứng chỉ & Bằng cấp</h3>
                                </div>
                                {isEditing && (
                                    <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1 text-violet-600">
                                        <Plus className="w-4 h-4" /> Thêm
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {certificates.map((cert, i) => (
                                    <motion.div
                                        key={cert.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + i * 0.08 }}
                                        className="flex items-start gap-3 p-3 rounded-xl border border-base-300 hover:border-violet-500/30 transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
                                            <Award className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="font-bold text-sm text-base-content truncate">{cert.name}</h4>
                                                {cert.verified && <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                                            </div>
                                            <p className="text-xs text-base-content/50">{cert.issuer} • {cert.year}</p>
                                        </div>
                                        {isEditing && (
                                            <button className="btn btn-ghost btn-xs btn-circle text-red-500 opacity-0 group-hover:opacity-100">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Reviews */}
                        <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-500" />
                                    <h3 className="text-lg font-black text-base-content">Đánh giá từ Học viên</h3>
                                </div>
                                <button className="btn btn-ghost btn-xs font-bold text-violet-600">
                                    Xem tất cả <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {topReviews.map((review, i) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="p-4 rounded-xl border border-base-300"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="avatar">
                                                <div className="w-8 h-8 rounded-full">
                                                    <img src={review.avatar} alt={review.student} />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-base-content">{review.student}</p>
                                                <p className="text-xs text-base-content/50">{review.course}</p>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, s) => (
                                                    <Star
                                                        key={s}
                                                        className={`w-3.5 h-3.5 ${s < review.rating ? 'text-amber-400 fill-amber-400' : 'text-base-300'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-base-content/70 leading-relaxed">{review.text}</p>
                                        <p className="text-[10px] text-base-content/40 mt-2">{review.date}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </ExpertLayout>
    );
}
