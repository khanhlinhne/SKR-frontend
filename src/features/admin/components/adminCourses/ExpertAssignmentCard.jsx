import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    UserCheck, UserPlus, Mail, Search,
    Loader2, ChevronDown, X, Award, Check, AlertCircle,
    Phone, MapPin, CalendarDays, UserCircle, Shield,
} from 'lucide-react';
import { cardVariants } from './constants';
import adminApi from '@/shared/api/adminApi';

const ROLE_LABELS = {
    admin: 'Quản trị hệ thống',
    creator: 'Expert / Creator',
    expert: 'Expert',
    premium_user: 'Premium',
    learner: 'Học viên',
};

function resolveResponseData(response) {
    return response?.data ?? response?.user ?? response ?? {};
}

function resolveExpertId(source) {
    return source?.userId || source?.user_id || source?.id || source?._id || null;
}

function resolveAvatarUrl(source) {
    return source?.avatarUrl || source?.avatar_url || source?.avatar || '';
}

function extractRoleCodes(roles) {
    if (!Array.isArray(roles)) return [];

    return roles
        .map((role) => {
            if (typeof role === 'string') return role;
            return role?.roleCode || role?.role_code || role?.code || null;
        })
        .filter(Boolean);
}

function formatDateLabel(value) {
    if (!value) return 'Chưa cập nhật';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';

    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function normalizeExpertProfile(source) {
    if (!source) return null;

    const user = resolveResponseData(source);
    const roleCodes = extractRoleCodes(user.roles);
    const fallbackRole = user.roleCode || user.role || 'creator';
    const roleLabels = Array.from(
        new Set(
            (roleCodes.length > 0 ? roleCodes : [fallbackRole])
                .map((role) => ROLE_LABELS[role] || role)
                .filter(Boolean),
        ),
    );
    const name = user.fullName || user.displayName || user.username || user.name || 'Expert';
    const avatarUrl = resolveAvatarUrl(user)
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=96`;
    const isActive = user.isActive ?? (user.isBanned !== undefined ? !user.isBanned : true);

    return {
        id: resolveExpertId(user),
        name,
        email: user.email || '',
        phone: user.phoneNumber || user.phone || '',
        location: user.location || user.address || '',
        bio: user.bio || user.description || '',
        username: user.username || '',
        avatarUrl,
        roles: roleLabels.length > 0 ? roleLabels : ['Expert / Creator'],
        joinDate: formatDateLabel(user.createdAt || user.createdAtUtc || user.created_at || user.joinDate),
        isActive: Boolean(isActive),
    };
}

function ProfileInfoRow({ icon: Icon, label, value }) {
    return (
        <div className="rounded-xl border border-base-300/70 bg-base-100/80 px-4 py-3">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-base-200 text-base-content/60">
                    <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-base-content/40">{label}</p>
                    <p className="mt-1 text-sm font-medium text-base-content/80 break-words">{value}</p>
                </div>
            </div>
        </div>
    );
}

/**
 * ExpertAssignmentCard — Hiển thị và phân công expert cho khóa học
 * - Nếu đã có expert: hiển thị thông tin expert + nút đổi
 * - Nếu chưa có: hiển thị nút chọn expert
 * - Bật modal/dropdown để chọn expert từ danh sách
 */
export default function ExpertAssignmentCard({ creator, courseId, onExpertAssigned }) {
    const creatorId = resolveExpertId(creator);
    const [showPicker, setShowPicker] = useState(false);
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [loadedProfileId, setLoadedProfileId] = useState(null);
    const [expertProfile, setExpertProfile] = useState(() => normalizeExpertProfile(creator));

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

    useEffect(() => {
        setShowProfile(false);
        setProfileLoading(false);
        setProfileError('');
        setLoadedProfileId(null);
        setExpertProfile(normalizeExpertProfile(creator));
    }, [creator]);

    const loadExpertProfile = useCallback(async (force = false) => {
        if (!creatorId) return;
        if (!force && loadedProfileId === creatorId) return;

        setProfileLoading(true);
        setProfileError('');

        try {
            const response = await adminApi.getUserById(creatorId);
            setExpertProfile(normalizeExpertProfile(response));
            setLoadedProfileId(creatorId);
        } catch (err) {
            console.error('Error fetching expert profile:', err);
            setProfileError(err?.response?.data?.message || 'Không thể tải hồ sơ expert lúc này.');
        } finally {
            setProfileLoading(false);
        }
    }, [creatorId, loadedProfileId]);

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

    const handleToggleProfile = () => {
        if (!creatorId) return;

        if (showProfile) {
            setShowProfile(false);
            return;
        }

        setShowProfile(true);
        void loadExpertProfile();
    };

    const currentProfile = expertProfile || normalizeExpertProfile(creator);
    const contactEmail = currentProfile?.email || creator?.email || '';

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
                        onClick={() => {
                            setShowPicker(true);
                            setShowProfile(false);
                        }}
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
                                        const expertId = resolveExpertId(expert);
                                        const isCurrentExpert = creatorId === resolveExpertId(expert);
                                        return (
                                            <motion.button
                                                key={expertId}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => !isCurrentExpert && handleAssign(expertId)}
                                                disabled={assigning || isCurrentExpert || !expertId}
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
                                        src={currentProfile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile?.name || 'E')}&background=8b5cf6&color=fff&size=56`}
                                        alt={currentProfile?.name}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base text-base-content truncate">
                                    {currentProfile?.name}
                                </h4>
                                {currentProfile?.bio && (
                                    <p className="text-xs text-base-content/50 mt-0.5 line-clamp-2">
                                        {currentProfile.bio}
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
                            <a
                                href={contactEmail ? `mailto:${contactEmail}` : undefined}
                                className={`btn btn-sm flex-1 btn-ghost rounded-xl font-bold gap-1 text-xs ${!contactEmail ? 'btn-disabled pointer-events-none opacity-50' : ''}`}
                            >
                                <Mail className="w-3.5 h-3.5" />
                                Liên hệ
                            </a>
                            <button
                                onClick={handleToggleProfile}
                                className="btn btn-sm flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-none rounded-xl font-bold gap-1 text-xs"
                            >
                                {profileLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
                                )}
                                {showProfile ? 'Ẩn hồ sơ' : 'Xem hồ sơ'}
                            </button>
                        </div>

                        <AnimatePresence initial={false}>
                            {showProfile && currentProfile && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.22 }}
                                    className="mt-4 overflow-hidden"
                                >
                                    <div className="rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.04] to-purple-500/[0.08] p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-base-300/70 pb-4">
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-600">
                                                    Hồ sơ expert
                                                </p>
                                                <h5 className="mt-1 text-sm font-black text-base-content">
                                                    Thông tin chi tiết hiển thị ngay tại trang này
                                                </h5>
                                            </div>
                                            {profileLoading && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-base-content/50">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
                                                    Đang đồng bộ hồ sơ
                                                </div>
                                            )}
                                        </div>

                                        {profileError && (
                                            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                                                <AlertCircle className="mt-0.5 w-4 h-4 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p>{profileError}</p>
                                                    <button
                                                        onClick={() => void loadExpertProfile(true)}
                                                        className="mt-1 text-xs font-bold underline underline-offset-2"
                                                    >
                                                        Thử tải lại
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 flex items-start gap-4">
                                            <div className="avatar">
                                                <div className="w-16 h-16 rounded-2xl ring-2 ring-violet-500/20 ring-offset-2 ring-offset-base-100">
                                                    <img src={currentProfile.avatarUrl} alt={currentProfile.name} />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="text-base font-black text-base-content">
                                                        {currentProfile.name}
                                                    </h4>
                                                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                                        currentProfile.isActive
                                                            ? 'bg-emerald-500/10 text-emerald-600'
                                                            : 'bg-rose-500/10 text-rose-600'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            currentProfile.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                                                        }`} />
                                                        {currentProfile.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-base-content/55 break-words">
                                                    {currentProfile.email || 'Chưa cập nhật email'}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {currentProfile.roles.map((role) => (
                                                        <span
                                                            key={role}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-700"
                                                        >
                                                            <Award className="w-3 h-3" />
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <ProfileInfoRow icon={Mail} label="Email" value={currentProfile.email || 'Chưa cập nhật'} />
                                            <ProfileInfoRow icon={Phone} label="Điện thoại" value={currentProfile.phone || 'Chưa cập nhật'} />
                                            <ProfileInfoRow icon={MapPin} label="Khu vực" value={currentProfile.location || 'Chưa cập nhật'} />
                                            <ProfileInfoRow icon={UserCircle} label="Username" value={currentProfile.username || 'Chưa cập nhật'} />
                                            <ProfileInfoRow icon={CalendarDays} label="Ngày tham gia" value={currentProfile.joinDate} />
                                            <ProfileInfoRow icon={Shield} label="Vai trò chính" value={currentProfile.roles[0] || 'Expert / Creator'} />
                                        </div>

                                        <div className="mt-4 rounded-xl border border-base-300/70 bg-base-100/80 px-4 py-3">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-base-content/40">
                                                Giới thiệu
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-base-content/75">
                                                {currentProfile.bio || 'Expert này chưa cập nhật mô tả hồ sơ.'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
