import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DashboardSidebar } from '@/features/learner/components';
import { authApi } from '@/shared/api';
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

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState(DEFAULT_USER_DATA);
    const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await authApi.getMe();
                const user = response.data || response.user || response;
                setUserData((prev) => ({
                    ...prev,
                    name: user.fullName || user.displayName || user.username || prev.name,
                    email: user.email || prev.email,
                    phone: user.phoneNumber || prev.phone,
                    location: user.location || prev.location,
                    bio: user.bio || prev.bio,
                    joinDate:
                        user.createdAt || user.createdAtUtc
                            ? new Date(user.createdAt || user.createdAtUtc).toLocaleDateString('vi-VN', {
                                  month: 'long',
                                  year: 'numeric',
                              })
                            : prev.joinDate,
                    isPremium: user.isPremium || false,
                }));
            } catch (error) {
                if (error.response?.status !== 401) {
                    console.error('Failed to fetch user data:', error);
                }
            }
        };

        fetchUserData();
    }, []);

    const handleUserFieldChange = (field, value) => {
        setUserData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNotificationToggle = (key, value) => {
        setNotifications((prev) => ({ ...prev, [key]: value }));
    };

    const handlePasswordFieldChange = (field, value) => {
        setPasswordData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            await authApi.updateProfile({
                fullName: userData.name,
                phoneNumber: userData.phone,
                bio: userData.bio,
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert(error.response?.data?.message || 'Cập nhật hồ sơ thất bại');
        } finally {
            setSaving(false);
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
        <div className="flex h-screen overflow-hidden bg-base-200">
            <DashboardSidebar />

            <div className="flex flex-1 flex-col overflow-hidden">
                <ProfileHeader />

                <motion.main className="flex-1 overflow-y-auto" variants={containerVariants} initial="hidden" animate="visible">
                    <ProfileHero
                        userData={userData}
                        rank={USER_STATS.rank}
                        isEditing={isEditing}
                        onToggleEditing={() => setIsEditing((prev) => !prev)}
                        variants={cardVariants}
                    />

                    <ProfileStatsGrid userStats={USER_STATS} variants={cardVariants} />

                    <div className="mx-auto max-w-7xl px-8 pb-8">
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
