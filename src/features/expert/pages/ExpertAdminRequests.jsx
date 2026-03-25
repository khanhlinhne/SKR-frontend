import { useState } from 'react';
import { motion } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import {
    Inbox,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    ArrowUpRight,
    MessageSquare,
    Pencil,
    RefreshCw,
    FileText,
    BookOpen,
    User,
    Calendar,
    ChevronRight,
    Filter,
    Search,
    Eye,
    Send,
    MoreHorizontal,
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

// ===== CONFIG =====
const statusConfig = {
    pending: { label: 'Chờ xử lý', icon: Clock, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
    in_progress: { label: 'Đang xử lý', icon: RefreshCw, color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
    completed: { label: 'Hoàn thành', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
    rejected: { label: 'Từ chối', icon: XCircle, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
};

const priorityConfig = {
    urgent: { label: 'Khẩn cấp', color: 'text-red-500 bg-red-500/10' },
    high: { label: 'Cao', color: 'text-orange-500 bg-orange-500/10' },
    normal: { label: 'Bình thường', color: 'text-blue-500 bg-blue-500/10' },
    low: { label: 'Thấp', color: 'text-slate-500 bg-slate-500/10' },
};

const typeConfig = {
    content_edit: { label: 'Chỉnh sửa nội dung', icon: Pencil, color: 'from-blue-500 to-cyan-500' },
    data_update: { label: 'Cập nhật dữ liệu', icon: RefreshCw, color: 'from-emerald-500 to-teal-500' },
    support: { label: 'Hỗ trợ chuyên môn', icon: MessageSquare, color: 'from-violet-500 to-purple-500' },
    review: { label: 'Duyệt nội dung', icon: Eye, color: 'from-amber-500 to-orange-500' },
};

// ===== MOCK DATA =====
const requestsData = [
    {
        id: 'REQ-001',
        title: 'Cập nhật nội dung bài giảng React Hooks',
        description: 'Cần cập nhật lại phần useEffect theo React 19 mới nhất. Bổ sung ví dụ về use() hook và Server Components.',
        type: 'content_edit',
        priority: 'high',
        status: 'pending',
        adminName: 'Admin Hùng',
        adminAvatar: 'https://i.pravatar.cc/150?img=12',
        course: 'React & Next.js Masterclass',
        createdAt: '22/03/2026',
        deadline: '28/03/2026',
        comments: 3,
    },
    {
        id: 'REQ-002',
        title: 'Bổ sung quiz cho chương State Management',
        description: 'Thêm 15 câu hỏi trắc nghiệm cho chương 4 về Redux, Zustand và Context API.',
        type: 'review',
        priority: 'normal',
        status: 'in_progress',
        adminName: 'Admin Linh',
        adminAvatar: 'https://i.pravatar.cc/150?img=5',
        course: 'React & Next.js Masterclass',
        createdAt: '20/03/2026',
        deadline: '30/03/2026',
        comments: 5,
    },
    {
        id: 'REQ-003',
        title: 'Review nội dung khóa Python Data Science',
        description: 'Kiểm tra và cải thiện chất lượng video bài giảng, đảm bảo âm thanh rõ ràng và nội dung chuẩn xác.',
        type: 'support',
        priority: 'urgent',
        status: 'pending',
        adminName: 'Admin Hùng',
        adminAvatar: 'https://i.pravatar.cc/150?img=12',
        course: 'Python cho Data Science',
        createdAt: '21/03/2026',
        deadline: '25/03/2026',
        comments: 1,
    },
    {
        id: 'REQ-004',
        title: 'Cập nhật giá và mô tả khóa học',
        description: 'Cập nhật lại giá khóa học UI/UX Design từ ₫399,000 lên ₫499,000 và bổ sung mô tả chi tiết hơn.',
        type: 'data_update',
        priority: 'low',
        status: 'completed',
        adminName: 'Admin Linh',
        adminAvatar: 'https://i.pravatar.cc/150?img=5',
        course: 'UI/UX Design Fundamentals',
        createdAt: '15/03/2026',
        deadline: '20/03/2026',
        comments: 2,
    },
    {
        id: 'REQ-005',
        title: 'Sửa lỗi video bài 7 không phát',
        description: 'Video bài giảng số 7 trong chương 2 bị lỗi encoding, cần upload lại.',
        type: 'content_edit',
        priority: 'urgent',
        status: 'completed',
        adminName: 'Admin Hùng',
        adminAvatar: 'https://i.pravatar.cc/150?img=12',
        course: 'React & Next.js Masterclass',
        createdAt: '10/03/2026',
        deadline: '12/03/2026',
        comments: 4,
    },
];

const statsOverview = [
    { label: 'Chờ xử lý', value: 2, icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { label: 'Đang xử lý', value: 1, icon: RefreshCw, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Hoàn thành', value: 2, icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    { label: 'Quá hạn', value: 0, icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
];

// ===== MAIN COMPONENT =====
export default function ExpertAdminRequests() {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);

    const filteredRequests = requestsData.filter(req => {
        const matchSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase())
            || req.course.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === 'all' || req.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content flex items-center gap-3">
                            <Inbox className="w-8 h-8 text-violet-500" />
                            Yêu cầu từ Quản trị viên
                        </h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Tiếp nhận và xử lý các yêu cầu chỉnh sửa, cập nhật từ Admin
                        </p>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {statsOverview.map((stat, i) => (
                        <div key={i} className="bg-base-100 rounded-xl p-4 border border-base-300 shadow-sm flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bgColor}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-base-content">{stat.value}</p>
                                <p className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Toolbar */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Tìm kiếm yêu cầu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input input-bordered w-full pl-10 rounded-xl bg-base-100 text-sm"
                        />
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                    </div>
                    <div className="flex gap-1 bg-base-100 rounded-xl border border-base-300 p-1">
                        {[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'pending', label: 'Chờ xử lý' },
                            { value: 'in_progress', label: 'Đang xử lý' },
                            { value: 'completed', label: 'Hoàn thành' },
                        ].map(filter => (
                            <button
                                key={filter.value}
                                onClick={() => setFilterStatus(filter.value)}
                                className={`btn btn-sm rounded-lg font-bold ${filterStatus === filter.value
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none'
                                    : 'btn-ghost'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Requests List */}
                <div className="space-y-4">
                    {filteredRequests.map((request, i) => {
                        const status = statusConfig[request.status];
                        const priority = priorityConfig[request.priority];
                        const type = typeConfig[request.type];
                        const StatusIcon = status.icon;
                        const TypeIcon = type.icon;

                        return (
                            <motion.div
                                key={request.id}
                                variants={cardVariants}
                                className="bg-base-100 rounded-2xl border border-base-300 shadow-lg p-5 hover:shadow-xl transition-shadow cursor-pointer group"
                                onClick={() => setSelectedRequest(selectedRequest === request.id ? null : request.id)}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Type Icon */}
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                                        <TypeIcon className="w-6 h-6 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-base-content/40 font-mono font-bold">{request.id}</span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priority.color}`}>
                                                        {priority.label}
                                                    </span>
                                                </div>
                                                <h3 className="font-black text-base-content text-base">{request.title}</h3>
                                            </div>
                                            <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border flex-shrink-0 ${status.color}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {status.label}
                                            </span>
                                        </div>

                                        <p className="text-sm text-base-content/60 mt-2 line-clamp-2">{request.description}</p>

                                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-base-content/50">
                                            <span className="flex items-center gap-1 font-medium">
                                                <BookOpen className="w-3 h-3" />
                                                {request.course}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <img src={request.adminAvatar} alt="" className="w-4 h-4 rounded-full" />
                                                {request.adminName}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Hạn: {request.deadline}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" />
                                                {request.comments} bình luận
                                            </span>
                                        </div>

                                        {/* Expanded actions */}
                                        {selectedRequest === request.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-4 pt-4 border-t border-base-300 flex gap-2"
                                            >
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Bắt đầu xử lý
                                                        </button>
                                                        <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5 text-red-500">
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                                {request.status === 'in_progress' && (
                                                    <button className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none rounded-xl font-bold gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Đánh dấu hoàn thành
                                                    </button>
                                                )}
                                                <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    Bình luận
                                                </button>
                                                <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Chi tiết
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {filteredRequests.length === 0 && (
                    <motion.div variants={cardVariants} className="text-center py-16">
                        <Inbox className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
                        <h3 className="text-lg font-black text-base-content/50">Không có yêu cầu nào</h3>
                        <p className="text-sm text-base-content/40">Các yêu cầu từ Admin sẽ hiển thị tại đây</p>
                    </motion.div>
                )}
            </motion.div>
        </ExpertLayout>
    );
}
