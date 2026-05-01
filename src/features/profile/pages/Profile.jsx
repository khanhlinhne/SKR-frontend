import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DashboardSidebar } from '@/features/learner/components';
import { authApi, uploadApi } from '@/shared/api';
import { useCurrentUserProfile } from '@/shared/user';
import {
    cardVariants,
    containerVariants,
    DEFAULT_NOTIFICATIONS,
    DEFAULT_USER_DATA,
    USER_STATS,
} from '@/features/profile/constants';
import {
    ProfileDangerZoneCard,
    ProfileHeader,
    ProfileHero,
    ProfileNotificationCard,
    ProfilePersonalInfoCard,
    ProfilePremiumCard,
    ProfileSecurityCard,
    ProfileStatsGrid,
} from '@/features/profile/components';

const MAX_AVATAR_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function resolveResponseData(response) {
    return response?.data || response?.user || response || {};
}

function formatJoinDate(createdAt, fallback) {
    if (!createdAt) {
        return fallback;
    }

    const parsedDate = new Date(createdAt);
    if (Number.isNaN(parsedDate.getTime())) {
        return fallback;
    }

    return parsedDate.toLocaleDateString('vi-VN', {
        month: 'long',
        year: 'numeric',
    });
}

function resolveAvatarUrl(source, fallback = '') {
    return source?.avatarUrl || source?.avatar_url || source?.avatar || fallback || '';
}

function resolveUploadedImageUrl(response) {
    const payload = resolveResponseData(response);
    return payload.imageUrl || payload.url || payload.secure_url || payload.fileUrl || payload.path || '';
}

function mapUserToProfileForm(user, fallback = DEFAULT_USER_DATA) {
    const resolvedUser = resolveResponseData(user);

    return {
        ...fallback,
        name: resolvedUser.fullName || resolvedUser.displayName || resolvedUser.username || resolvedUser.name || fallback.name,
        email: resolvedUser.email ?? fallback.email,
        phone: resolvedUser.phoneNumber ?? resolvedUser.phone ?? fallback.phone,
        location: resolvedUser.location ?? fallback.location,
        bio: resolvedUser.bio ?? fallback.bio,
        avatarUrl: resolveAvatarUrl(resolvedUser, fallback.avatarUrl),
        joinDate: formatJoinDate(resolvedUser.createdAt || resolvedUser.createdAtUtc, fallback.joinDate),
        isPremium: resolvedUser.isPremium ?? fallback.isPremium,
    };
}

export default function Profile() {
    const { profile, refreshProfile, setProfileLocally } = useCurrentUserProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState(() =>
        mapUserToProfileForm({
            fullName: profile.name,
            email: profile.email,
            avatarUrl: profile.avatarUrl,
            isPremium: profile.isPremium,
        }),
    );
    const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarFeedback, setAvatarFeedback] = useState(null);

    useEffect(() => {
        setUserData((prev) => ({
            ...prev,
            name: profile.name || prev.name,
            email: profile.email || prev.email,
            avatarUrl: profile.avatarUrl || prev.avatarUrl,
            isPremium: profile.isPremium ?? prev.isPremium,
        }));
    }, [profile]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await authApi.getMe({ forceRefresh: true });
                const user = resolveResponseData(response);
                setUserData((prev) => mapUserToProfileForm(user, prev));
                setProfileLocally(user);
            } catch (error) {
                if (error.response?.status !== 401) {
                    console.error('Failed to fetch user data:', error);
                }
            }
        };

        void fetchUserData();
    }, [setProfileLocally]);

    const handleUserFieldChange = (field, value) => {
        setAvatarFeedback(null);
        setUserData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNotificationToggle = (key, value) => {
        setNotifications((prev) => ({ ...prev, [key]: value }));
    };

    const handlePasswordFieldChange = (field, value) => {
        setPasswordData((prev) => ({ ...prev, [field]: value }));
    };

    const syncUserDataFromResponse = (responseUser, fallbackOverrides = {}) => {
        const syncedProfile = setProfileLocally({
            ...responseUser,
            fullName: responseUser.fullName || fallbackOverrides.name || userData.name,
            displayName: responseUser.displayName || fallbackOverrides.name || userData.name,
            email: responseUser.email || fallbackOverrides.email || userData.email,
            avatarUrl: resolveAvatarUrl(responseUser, fallbackOverrides.avatarUrl || userData.avatarUrl),
            isPremium: responseUser.isPremium ?? fallbackOverrides.isPremium ?? userData.isPremium,
        });

        setUserData((prev) =>
            mapUserToProfileForm(
                {
                    ...responseUser,
                    fullName: syncedProfile.name,
                    email: syncedProfile.email,
                    avatarUrl: syncedProfile.avatarUrl,
                    isPremium: syncedProfile.isPremium,
                    phoneNumber: responseUser.phoneNumber ?? fallbackOverrides.phone ?? prev.phone,
                    location: responseUser.location ?? fallbackOverrides.location ?? prev.location,
                    bio: responseUser.bio ?? fallbackOverrides.bio ?? prev.bio,
                    createdAt: responseUser.createdAt || responseUser.createdAtUtc,
                },
                prev,
            ),
        );
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setAvatarFeedback(null);
            const response = await authApi.updateProfile({
                fullName: userData.name,
                displayName: userData.name,
                phoneNumber: userData.phone,
                location: userData.location,
                bio: userData.bio,
                avatarUrl: userData.avatarUrl || null,
                avatar: userData.avatarUrl || null,
            });
            syncUserDataFromResponse(resolveResponseData(response), userData);
            setIsEditing(false);
            setAvatarFeedback({
                type: 'success',
                message: 'Tên và ảnh đại diện đã được đồng bộ trên tài khoản của bạn.',
            });
            void refreshProfile({ force: true });
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert(error.response?.data?.message || 'Cập nhật hồ sơ thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarSelect = async (file) => {
        if (!file) {
            return;
        }

        if (!file.type?.startsWith('image/')) {
            setAvatarFeedback({
                type: 'error',
                message: 'Chỉ hỗ trợ file ảnh PNG, JPG, WEBP hoặc GIF.',
            });
            return;
        }

        if (file.size > MAX_AVATAR_IMAGE_SIZE_BYTES) {
            setAvatarFeedback({
                type: 'error',
                message: 'Ảnh quá lớn. Vui lòng chọn ảnh tối đa 5MB.',
            });
            return;
        }

        setAvatarUploading(true);
        setAvatarFeedback(null);

        try {
            const uploadResponse = await uploadApi.uploadImage(file);
            const avatarUrl = resolveUploadedImageUrl(uploadResponse);

            if (!avatarUrl) {
                throw new Error('Chưa nhận được URL ảnh từ máy chủ.');
            }

            const response = await authApi.updateProfile({
                fullName: userData.name,
                displayName: userData.name,
                phoneNumber: userData.phone,
                location: userData.location,
                bio: userData.bio,
                avatarUrl,
                avatar: avatarUrl,
            });
            syncUserDataFromResponse(resolveResponseData(response), {
                ...userData,
                avatarUrl,
            });
            setAvatarFeedback({
                type: 'success',
                message: 'Ảnh đại diện đã được cập nhật trên toàn bộ tài khoản.',
            });
            void refreshProfile({ force: true });
        } catch (error) {
            console.error('Failed to update avatar:', error);
            setAvatarFeedback({
                type: 'error',
                message: error.response?.data?.message || error.message || 'Cập nhật ảnh đại diện thất bại.',
            });
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Mật khẩu mới không khớp.');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        try {
            setSaving(true);
            await authApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setPasswordSuccess('Đổi mật khẩu thành công.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Failed to change password:', error);
            setPasswordError(error.response?.data?.message || 'Đổi mật khẩu thất bại.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-dvh overflow-hidden bg-base-200">
            <DashboardSidebar />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <ProfileHeader />

                <motion.main className="flex-1 overflow-y-auto pb-24 md:pb-0" variants={containerVariants} initial="hidden" animate="visible">
                    <ProfileHero
                        userData={userData}
                        rank={USER_STATS.rank}
                        isEditing={isEditing}
                        avatarUploading={avatarUploading}
                        avatarFeedback={avatarFeedback}
                        onAvatarSelect={handleAvatarSelect}
                        onToggleEditing={() => setIsEditing((prev) => !prev)}
                        variants={cardVariants}
                    />

                    <ProfileStatsGrid userStats={USER_STATS} variants={cardVariants} />

                    <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="space-y-6 lg:col-span-2">
                                <ProfilePersonalInfoCard
                                    userData={userData}
                                    isEditing={isEditing}
                                    saving={saving}
                                    onSave={handleSaveProfile}
                                    onChangeField={handleUserFieldChange}
                                    variants={cardVariants}
                                />
                                <ProfileSecurityCard
                                    passwordData={passwordData}
                                    onPasswordFieldChange={handlePasswordFieldChange}
                                    showPassword={showPassword}
                                    showNewPassword={showNewPassword}
                                    showConfirmPassword={showConfirmPassword}
                                    onTogglePassword={() => setShowPassword((prev) => !prev)}
                                    onToggleNewPassword={() => setShowNewPassword((prev) => !prev)}
                                    onToggleConfirmPassword={() => setShowConfirmPassword((prev) => !prev)}
                                    passwordError={passwordError}
                                    passwordSuccess={passwordSuccess}
                                    saving={saving}
                                    onSubmit={handleChangePassword}
                                    variants={cardVariants}
                                />
                            </div>

                            <div className="space-y-6">
                                <ProfileNotificationCard
                                    notifications={notifications}
                                    onToggleNotification={handleNotificationToggle}
                                    variants={cardVariants}
                                />
                                {userData.isPremium && <ProfilePremiumCard variants={cardVariants} />}
                                <ProfileDangerZoneCard variants={cardVariants} />
                            </div>
                        </div>
                    </div>
                </motion.main>
            </div>
        </div>
    );
}
