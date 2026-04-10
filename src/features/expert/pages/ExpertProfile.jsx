import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { authApi, uploadApi } from '@/shared/api';
import { ExpertLayout } from '@/features/expert/components';
import { getUserInitials, useCurrentUserProfile } from '@/shared/user';
import {
    ArrowUpRight,
    BookOpen,
    Camera,
    CalendarDays,
    CheckCircle2,
    Crown,
    IdCard,
    Loader2,
    Mail,
    MapPin,
    PenSquare,
    Phone,
    RefreshCw,
    Save,
    Shield,
    Sparkles,
    Star,
    UserCircle,
} from 'lucide-react';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const DEFAULT_FORM = {
    userId: null,
    username: '',
    name: 'Chuyên gia SKR',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatarUrl: '',
    roles: [],
    isPremium: false,
    joinDateLabel: 'Đang cập nhật',
    createdAt: null,
};

const ROLE_LABELS = {
    admin: 'Quản trị hệ thống',
    creator: 'Chuyên gia sáng tạo',
    expert: 'Chuyên gia',
    premium_user: 'Premium',
    learner: 'Học viên',
};

const QUICK_ACTIONS = [
    {
        title: 'Tiếp tục xây khóa học',
        description: 'Cập nhật lesson, câu hỏi và nội dung bài giảng trong curriculum.',
        to: '/expert/curriculum',
        icon: BookOpen,
        gradient: 'from-violet-500 to-fuchsia-600',
    },
    {
        title: 'Tạo nội dung với AI',
        description: 'Mở AI Assistant để phác thảo câu hỏi và học liệu nhanh hơn.',
        to: '/expert/ai-assistant',
        icon: Sparkles,
        gradient: 'from-amber-400 to-orange-500',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

function resolveResponseData(response) {
    return response?.data || response?.user || response || {};
}

function resolveAvatarUrl(source, fallback = '') {
    return source?.avatarUrl || source?.avatar_url || source?.avatar || fallback || '';
}

function resolveUploadedImageUrl(response) {
    const payload = resolveResponseData(response);
    return payload.imageUrl || payload.url || payload.secure_url || payload.fileUrl || payload.path || '';
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

function formatJoinDate(createdAt) {
    if (!createdAt) return 'Đang cập nhật';
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return 'Đang cập nhật';
    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
}

function mapUserToForm(source, fallback = DEFAULT_FORM) {
    const user = resolveResponseData(source);
    const roles = extractRoleCodes(user.roles || fallback.roles);

    return {
        ...fallback,
        userId: user.userId || user.user_id || user.id || fallback.userId,
        username: user.username || fallback.username,
        name: user.fullName || user.displayName || user.username || user.name || fallback.name,
        email: user.email ?? fallback.email,
        phone: user.phoneNumber ?? user.phone ?? fallback.phone,
        location: user.location ?? fallback.location,
        bio: user.bio ?? fallback.bio,
        avatarUrl: resolveAvatarUrl(user, fallback.avatarUrl),
        roles,
        isPremium: Boolean((user.isPremium ?? fallback.isPremium) || roles.includes('premium_user')),
        joinDateLabel: formatJoinDate(user.createdAt || user.createdAtUtc || fallback.createdAt),
        createdAt: user.createdAt || user.createdAtUtc || fallback.createdAt,
    };
}

function getRoleBadges(roles) {
    const items = Array.from(new Set(roles || []));
    if (items.length === 0) return ['Expert'];
    return items.map((role) => ROLE_LABELS[role] || role);
}

function getCompletionItems(form) {
    return [
        ['Tên hiển thị', Boolean(form.name?.trim())],
        ['Ảnh đại diện', Boolean(form.avatarUrl)],
        ['Email', Boolean(form.email?.trim())],
        ['Điện thoại', Boolean(form.phone?.trim())],
        ['Khu vực hoạt động', Boolean(form.location?.trim())],
        ['Giới thiệu chuyên môn', Boolean(form.bio?.trim())],
    ].map(([label, completed]) => ({ label, completed }));
}

function StatCard({ icon: Icon, gradient, label, value, hint }) {
    return (
        <motion.div variants={cardVariants} className="rounded-[28px] border border-base-300 bg-base-100 p-5 shadow-lg shadow-slate-900/5">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="rounded-full bg-base-200 px-2.5 py-1 text-[11px] font-bold text-base-content/50">Studio</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/45">{label}</p>
            <p className="mt-3 text-2xl font-black text-base-content">{value}</p>
            <p className="mt-1 text-sm text-base-content/60">{hint}</p>
        </motion.div>
    );
}

function InfoRow({ icon: Icon, label, value, muted = false }) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-base-300 bg-base-100/70 px-4 py-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-base-200 text-base-content/70">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-base-content/40">{label}</p>
                <p className={`mt-1 text-sm ${muted ? 'text-base-content/45' : 'text-base-content/80'}`}>{value}</p>
            </div>
        </div>
    );
}

export default function ExpertProfile() {
    const avatarInputRef = useRef(null);
    const { profile, setProfileLocally } = useCurrentUserProfile();
    const [form, setForm] = useState(() =>
        mapUserToForm({
            fullName: profile.name,
            email: profile.email,
            avatarUrl: profile.avatarUrl,
            isPremium: profile.isPremium,
            roles: profile.roles,
        }),
    );
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);

    useEffect(() => {
        if (isEditing) return;
        setForm((prev) =>
            mapUserToForm(
                {
                    fullName: profile.name,
                    email: profile.email,
                    avatarUrl: profile.avatarUrl,
                    isPremium: profile.isPremium,
                    roles: profile.roles,
                },
                prev,
            ),
        );
    }, [isEditing, profile]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authApi.getMe({ forceRefresh: true });
                const user = resolveResponseData(response);
                setProfileLocally(user);
                setForm((prev) => mapUserToForm(user, prev));
                setLastSyncedAt(new Date());
            } catch (error) {
                if (error?.response?.status !== 401) {
                    setFeedback({ type: 'error', message: error?.response?.data?.message || 'Không thể tải hồ sơ chuyên gia lúc này.' });
                }
            } finally {
                setLoading(false);
            }
        };

        void fetchProfile();
    }, [setProfileLocally]);

    const completionItems = getCompletionItems(form);
    const completionRate = Math.round((completionItems.filter((item) => item.completed).length / completionItems.length) * 100);
    const roleBadges = getRoleBadges(form.roles);
    const syncLabel = lastSyncedAt
        ? lastSyncedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        : 'Chưa đồng bộ';
    const publicBio = form.bio?.trim() || 'Thêm mô tả chuyên môn để hồ sơ công khai của bạn thuyết phục hơn.';
    const stats = [
        {
            key: 'completion',
            label: 'Mức hoàn thiện',
            value: `${completionRate}%`,
            hint: 'Dựa trên các trường hồ sơ cốt lõi',
            icon: Sparkles,
            gradient: 'from-violet-500 to-fuchsia-600',
        },
        {
            key: 'roles',
            label: 'Vai trò kích hoạt',
            value: String(form.roles.length || 1),
            hint: roleBadges.join(' · '),
            icon: Shield,
            gradient: 'from-sky-500 to-cyan-600',
        },
        {
            key: 'contact',
            label: 'Kênh liên hệ',
            value: `${[form.email, form.phone, form.location].filter(Boolean).length}/3`,
            hint: 'Email, điện thoại và địa điểm',
            icon: Mail,
            gradient: 'from-emerald-500 to-teal-600',
        },
        {
            key: 'tier',
            label: 'Trạng thái tài khoản',
            value: form.isPremium ? 'Premium' : 'Standard',
            hint: form.isPremium ? 'Ưu tiên trải nghiệm nâng cao' : 'Có thể nâng cấp khi cần',
            icon: form.isPremium ? Crown : Star,
            gradient: form.isPremium ? 'from-amber-400 to-orange-500' : 'from-slate-500 to-slate-700',
        },
    ];

    const updateField = (field, value) => {
        setFeedback(null);
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const syncFormFromServer = (user, message) => {
        setProfileLocally(user);
        setForm((prev) => mapUserToForm(user, prev));
        setLastSyncedAt(new Date());
        if (message) setFeedback({ type: 'success', message });
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setFeedback(null);
            const response = await authApi.getMe({ forceRefresh: true });
            syncFormFromServer(resolveResponseData(response), 'Hồ sơ chuyên gia đã được làm mới từ tài khoản đăng nhập.');
        } catch (error) {
            setFeedback({ type: 'error', message: error?.response?.data?.message || 'Không thể làm mới hồ sơ lúc này.' });
        } finally {
            setRefreshing(false);
        }
    };

    const handleSaveProfile = async () => {
        const trimmedName = form.name.trim();
        if (!trimmedName) {
            setFeedback({ type: 'error', message: 'Tên hiển thị là bắt buộc để lưu hồ sơ chuyên gia.' });
            return;
        }

        try {
            setSaving(true);
            setFeedback(null);
            const response = await authApi.updateProfile({
                fullName: trimmedName,
                displayName: trimmedName,
                phoneNumber: form.phone.trim() || null,
                location: form.location.trim() || null,
                bio: form.bio.trim() || null,
                avatarUrl: form.avatarUrl || null,
                avatar: form.avatarUrl || null,
            });
            syncFormFromServer(resolveResponseData(response), 'Hồ sơ chuyên gia đã được cập nhật và đồng bộ trên toàn hệ thống.');
            setIsEditing(false);
        } catch (error) {
            setFeedback({ type: 'error', message: error?.response?.data?.message || 'Lưu hồ sơ thất bại. Vui lòng thử lại.' });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarSelect = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (!file.type?.startsWith('image/')) {
            setFeedback({ type: 'error', message: 'Chỉ hỗ trợ ảnh PNG, JPG, WEBP hoặc GIF cho avatar chuyên gia.' });
            return;
        }

        if (file.size > MAX_AVATAR_SIZE) {
            setFeedback({ type: 'error', message: 'Ảnh quá lớn. Vui lòng chọn file tối đa 5MB.' });
            return;
        }

        try {
            setUploadingAvatar(true);
            setFeedback(null);

            const uploadResponse = await uploadApi.uploadImage(file);
            const avatarUrl = resolveUploadedImageUrl(uploadResponse);
            if (!avatarUrl) throw new Error('Máy chủ chưa trả về URL ảnh hợp lệ.');

            const response = await authApi.updateProfile({
                fullName: form.name.trim() || form.name,
                displayName: form.name.trim() || form.name,
                phoneNumber: form.phone.trim() || null,
                location: form.location.trim() || null,
                bio: form.bio.trim() || null,
                avatarUrl,
                avatar: avatarUrl,
            });

            syncFormFromServer(resolveResponseData(response), 'Ảnh đại diện mới đã được áp dụng cho tài khoản chuyên gia.');
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error?.response?.data?.message || error?.message || 'Không thể cập nhật ảnh đại diện.',
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                <motion.section variants={cardVariants} className="relative overflow-hidden rounded-[32px] border border-violet-200/40 bg-base-100 shadow-xl shadow-violet-900/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.2),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.14),transparent_30%),linear-gradient(135deg,rgba(124,58,237,0.08),rgba(255,255,255,0))]" />
                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600" />
                    <div className="relative px-6 pb-6 pt-28 md:px-8">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                                <div className="relative">
                                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[28px] border-4 border-base-100 bg-base-200 shadow-2xl">
                                        {form.avatarUrl ? (
                                            <img src={form.avatarUrl} alt={form.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-base-200 text-3xl font-black text-base-content/70">
                                                {getUserInitials(form.name)}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        title="Cập nhật avatar"
                                        className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-base-100 text-violet-600 shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                    </button>
                                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                                </div>

                                <div className="max-w-3xl space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-700 shadow-sm">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Creator Studio
                                        </span>
                                        {roleBadges.map((role) => (
                                            <span key={role} className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-base-100/90 px-3 py-1 text-xs font-semibold text-base-content/75">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{form.name}</h1>
                                        <p className="mt-2 max-w-2xl text-sm leading-7 text-base-content/65 sm:text-base">{publicBio}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                                        <span className="inline-flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-violet-500" />
                                            Thành viên từ {form.joinDateLabel}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4 text-violet-500" />
                                            Đồng bộ lúc {syncLabel}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                            <IdCard className="h-4 w-4 text-violet-500" />
                                            ID {form.userId || 'Đang cập nhật'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    disabled={refreshing || saving || uploadingAvatar}
                                    className="btn rounded-2xl border-base-300 bg-base-100 px-5 font-bold text-base-content shadow-sm hover:border-violet-300 hover:bg-violet-50 disabled:opacity-60"
                                >
                                    {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                    Làm mới
                                </button>
                                {isEditing ? (
                                    <button
                                        type="button"
                                        onClick={handleSaveProfile}
                                        disabled={saving || uploadingAvatar}
                                        className="btn rounded-2xl border-none bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 font-bold text-white shadow-lg shadow-violet-500/25 disabled:opacity-60"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Lưu hồ sơ
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="btn rounded-2xl border-none bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 font-bold text-white shadow-lg shadow-violet-500/25"
                                    >
                                        <PenSquare className="h-4 w-4" />
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {feedback && (
                    <motion.div
                        variants={cardVariants}
                        className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                            feedback.type === 'success'
                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
                                : 'border-rose-500/20 bg-rose-500/10 text-rose-700'
                        }`}
                    >
                        {feedback.message}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.key} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                        <motion.section variants={cardVariants} className="rounded-[28px] border border-base-300 bg-base-100 p-6 shadow-lg shadow-slate-900/5">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-black text-base-content">Thông tin hồ sơ chuyên gia</h2>
                                    <p className="mt-1 text-sm text-base-content/60">
                                        Đồng bộ trực tiếp từ tài khoản đăng nhập. Email được giữ làm trường chỉ đọc.
                                    </p>
                                </div>
                                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-700">
                                    {loading ? 'Đang tải...' : 'Nguồn dữ liệu: /user/profile'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/45">Tên hiển thị</span>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(event) => updateField('name', event.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Nhập tên chuyên gia"
                                        className="input input-bordered h-12 w-full rounded-2xl border-base-300 bg-base-100 text-sm font-medium"
                                    />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/45">Email</span>
                                    <input
                                        type="email"
                                        value={form.email}
                                        disabled
                                        placeholder="Email tài khoản"
                                        className="input input-bordered h-12 w-full rounded-2xl border-base-300 bg-base-100 text-sm font-medium"
                                    />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/45">Điện thoại</span>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(event) => updateField('phone', event.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Thêm số điện thoại liên hệ"
                                        className="input input-bordered h-12 w-full rounded-2xl border-base-300 bg-base-100 text-sm font-medium"
                                    />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/45">Địa điểm</span>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(event) => updateField('location', event.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Ví dụ: TP.HCM, Việt Nam"
                                        className="input input-bordered h-12 w-full rounded-2xl border-base-300 bg-base-100 text-sm font-medium"
                                    />
                                </label>
                            </div>

                            <label className="mt-4 block space-y-2">
                                <span className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/45">Giới thiệu chuyên gia</span>
                                <textarea
                                    rows={5}
                                    value={form.bio}
                                    onChange={(event) => updateField('bio', event.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Mô tả ngắn về chuyên môn, lĩnh vực giảng dạy và thế mạnh nội dung."
                                    className="textarea textarea-bordered w-full rounded-[24px] border-base-300 bg-base-100 text-sm leading-7"
                                />
                            </label>

                            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                                <InfoRow icon={UserCircle} label="Tên đăng nhập" value={form.username || 'Chưa có username'} muted={!form.username} />
                                <InfoRow icon={Shield} label="Vai trò hệ thống" value={roleBadges.join(', ')} />
                                <InfoRow icon={Crown} label="Gói tài khoản" value={form.isPremium ? 'Premium' : 'Standard'} />
                            </div>
                        </motion.section>

                        <motion.section variants={cardVariants} className="rounded-[28px] border border-base-300 bg-base-100 p-6 shadow-lg shadow-slate-900/5">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-black text-base-content">Độ sẵn sàng hồ sơ</h2>
                                    <p className="mt-1 text-sm text-base-content/60">
                                        Hoàn thiện các trường cốt lõi để hồ sơ chuyên gia đủ mạnh và xuất hiện nhất quán trên hệ thống.
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-violet-500/10 px-4 py-2 text-right">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700">Progress</p>
                                    <p className="text-xl font-black text-violet-700">{completionRate}%</p>
                                </div>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-base-200">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 transition-all duration-500"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                                {completionItems.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-base-300 px-4 py-3">
                                        <span className="text-sm font-medium text-base-content/75">{item.label}</span>
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                            item.completed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                        }`}>
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            {item.completed ? 'Đã có' : 'Cần bổ sung'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    </div>

                    <div className="space-y-6">
                        <motion.section variants={cardVariants} className="overflow-hidden rounded-[28px] border border-base-300 bg-base-100 shadow-lg shadow-slate-900/5">
                            <div className="border-b border-base-300 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-5 text-white">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Public Preview</p>
                                <h2 className="mt-2 text-xl font-black">Hồ sơ công khai của chuyên gia</h2>
                            </div>
                            <div className="space-y-4 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-base-200 text-xl font-black text-base-content/70">
                                        {form.avatarUrl ? (
                                            <img src={form.avatarUrl} alt={form.name} className="h-full w-full object-cover" />
                                        ) : (
                                            getUserInitials(form.name)
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-lg font-black text-base-content">{form.name}</p>
                                        <p className="text-sm text-base-content/55">{roleBadges[0]}</p>
                                    </div>
                                </div>

                                <p className="text-sm leading-7 text-base-content/70">{publicBio}</p>

                                <div className="space-y-3">
                                    <InfoRow icon={Mail} label="Email hiển thị" value={form.email || 'Chưa có email'} muted={!form.email} />
                                    <InfoRow icon={Phone} label="Liên hệ nhanh" value={form.phone || 'Chưa cập nhật số điện thoại'} muted={!form.phone} />
                                    <InfoRow icon={MapPin} label="Khu vực hoạt động" value={form.location || 'Chưa cập nhật địa điểm'} muted={!form.location} />
                                </div>
                            </div>
                        </motion.section>

                        <motion.section variants={cardVariants} className="rounded-[28px] border border-base-300 bg-base-100 p-6 shadow-lg shadow-slate-900/5">
                            <div className="mb-4">
                                <h2 className="text-xl font-black text-base-content">Quick actions</h2>
                                <p className="mt-1 text-sm text-base-content/60">
                                    Mở nhanh các luồng công việc chính của expert ngay từ hồ sơ.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {QUICK_ACTIONS.map((action) => (
                                    <Link
                                        key={action.title}
                                        to={action.to}
                                        className="group flex items-start gap-4 rounded-[24px] border border-base-300 p-4 transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg"
                                    >
                                        <div className={`mt-0.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-lg`}>
                                            <action.icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-black text-base-content">{action.title}</p>
                                                <ArrowUpRight className="h-4 w-4 text-base-content/40 transition group-hover:text-violet-600" />
                                            </div>
                                            <p className="mt-1 text-sm leading-6 text-base-content/60">{action.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.section>
                    </div>
                </div>
            </motion.div>
        </ExpertLayout>
    );
}
