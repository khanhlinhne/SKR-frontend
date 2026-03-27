import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    UserCheck, UserPlus, Mail, ExternalLink, Search,
    Loader2, ChevronDown, X, Award, Check, AlertCircle,
} from 'lucide-react';
import { cardVariants } from './constants';
import adminApi from '@/shared/api/adminApi';

/**
 * ExpertAssignmentCard — Hiển thị và phân công expert cho khóa học
 * - Nếu đã có expert: hiển thị thông tin expert + nút đổi
 * - Nếu chưa có: hiển thị nút chọn expert
 * - Bật modal/dropdown để chọn expert từ danh sách
 */
export default function ExpertAssignmentCard({ creator, courseId, onExpertAssigned }) {
    const [showPicker, setShowPicker] = useState(false);
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchExperts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await adminApi.getExperts();
            const items = res?.data?.items ?? res?.items ?? [];
            setExperts(items);
        } catch (err) {
            console.error('Error fetching experts:', err);
            setError('Không thể tải danh sách expert');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (showPicker) {
            fetchExperts();
        }
    }, [showPicker, fetchExperts]);

    const handleAssign = async (expertId) => {
        if (!courseId) return;
        setAssigning(true);
        setError('');
        try {
            const res = await adminApi.assignExpert(courseId, expertId);
            setSuccessMsg('Phân công expert thành công!');
            setShowPicker(false);
            if (onExpertAssigned) {
                onExpertAssigned(res?.data ?? res);
            }
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Error assigning expert:', err);
            setError(err?.response?.data?.message || 'Không thể phân công expert. Vui lòng thử lại.');
        } finally {
            setAssigning(false);
        }
    };

    const filteredExperts = experts.filter((e) => {
        const q = searchTerm.toLowerCase();
        return (
            (e.fullName?.toLowerCase().includes(q)) ||
            (e.email?.toLowerCase().includes(q)) ||
            (e.username?.toLowerCase().includes(q))
        );
    });

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-violet-500" />
                    Expert phụ trách
                </h3>
                {creator && !showPicker && (
                    <button
                        onClick={() => setShowPicker(true)}
                        className="btn btn-xs btn-ghost text-violet-500 hover:bg-violet-500/10 font-bold gap-1 rounded-lg"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        Đổi expert
                    </button>
                )}
            </div>

            {/* Success message */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20"
                    >
                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                            <Check className="w-4 h-4" />
                            {successMsg}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-6">
                {/* Expert picker */}
                <AnimatePresence>
                    {showPicker && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="mb-4"
                        >
                            {/* Search & Close */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                                    <input
                                        type="text"
                                        placeholder="Tìm expert theo tên, email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="input input-sm w-full pl-9 pr-3 bg-base-200/50 border-base-300 rounded-xl text-sm focus:border-violet-500 focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setShowPicker(false);
                                        setSearchTerm('');
                                        setError('');
                                    }}
                                    className="btn btn-sm btn-circle btn-ghost"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-500 mb-3 px-1">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Expert list */}
                            <div className="max-h-64 overflow-y-auto space-y-1 rounded-xl border border-base-300 bg-base-200/30 p-2">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                                    </div>
                                ) : filteredExperts.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-base-content/50">
                                        {searchTerm ? 'Không tìm thấy expert phù hợp' : 'Chưa có expert nào trong hệ thống'}
                                    </div>
                                ) : (
                                    filteredExperts.map((expert) => {
                                        const isCurrentExpert = creator?.userId === expert.userId;
                                        return (
                                            <motion.button
                                                key={expert.userId}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => !isCurrentExpert && handleAssign(expert.userId)}
                                                disabled={assigning || isCurrentExpert}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                                                    isCurrentExpert
                                                        ? 'bg-violet-500/10 border border-violet-500/20 cursor-default'
                                                        : 'hover:bg-base-200 cursor-pointer border border-transparent'
                                                }`}
                                            >
                                                <div className="avatar">
                                                    <div className={`w-10 h-10 rounded-lg ${isCurrentExpert ? 'ring-2 ring-violet-500/40' : ''}`}>
                                                        <img
                                                            src={expert.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.fullName || 'E')}&background=8b5cf6&color=fff&size=40`}
                                                            alt={expert.fullName}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-bold text-base-content truncate">
                                                            {expert.fullName || expert.username}
                                                        </span>
                                                        {isCurrentExpert && (
                                                            <span className="text-[10px] font-bold text-violet-600 bg-violet-500/15 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                                                Hiện tại
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-base-content/50 truncate">
                                                        {expert.email}
                                                    </p>
                                                </div>
                                                {!isCurrentExpert && (
                                                    <div className="flex-shrink-0">
                                                        {assigning ? (
                                                            <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-base-content/30 -rotate-90" />
                                                        )}
                                                    </div>
                                                )}
                                                {isCurrentExpert && (
                                                    <Check className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                                )}
                                            </motion.button>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Current expert info or empty state */}
                {creator ? (
                    <>
                        {/* Expert info */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="avatar">
                                <div className="w-14 h-14 rounded-xl ring-2 ring-violet-500/30 ring-offset-2 ring-offset-base-100">
                                    <img
                                        src={creator.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.fullName || 'E')}&background=8b5cf6&color=fff&size=56`}
                                        alt={creator.fullName}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base text-base-content truncate">
                                    {creator.fullName || creator.displayName}
                                </h4>
                                {creator.bio && (
                                    <p className="text-xs text-base-content/50 mt-0.5 line-clamp-2">
                                        {creator.bio}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Task status */}
                        <div className="bg-base-200/40 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-base-content/50 font-medium">Vai trò</span>
                                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg text-violet-600 bg-violet-500/10">
                                    <Award className="w-3 h-3" />
                                    Expert / Creator
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-base-content/50 font-medium">Trạng thái</span>
                                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg text-emerald-600 bg-emerald-500/10">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Đã phân công
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                            <button className="btn btn-sm flex-1 btn-ghost rounded-xl font-bold gap-1 text-xs">
                                <Mail className="w-3.5 h-3.5" />
                                Liên hệ
                            </button>
                            <button className="btn btn-sm flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-none rounded-xl font-bold gap-1 text-xs">
                                <ExternalLink className="w-3.5 h-3.5" />
                                Xem hồ sơ
                            </button>
                        </div>
                    </>
                ) : (
                    /* Empty state — No expert assigned */
                    !showPicker && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center">
                                <UserPlus className="w-8 h-8 text-violet-500/60" />
                            </div>
                            <h4 className="text-sm font-bold text-base-content mb-1">
                                Chưa có Expert phụ trách
                            </h4>
                            <p className="text-xs text-base-content/50 mb-4 max-w-[220px] mx-auto">
                                Phân công một expert để xây dựng nội dung cho khóa học này
                            </p>
                            <button
                                onClick={() => setShowPicker(true)}
                                className="btn btn-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white border-none rounded-xl font-bold gap-1.5 shadow-lg shadow-violet-500/20"
                            >
                                <UserPlus className="w-4 h-4" />
                                Chọn Expert
                            </button>
                        </div>
                    )
                )}
            </div>
        </motion.div>
    );
}
