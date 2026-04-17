import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Layout, Mail, Server, ShieldCheck } from 'lucide-react';
import { AdminLayout } from '@/features/admin/components';
import { GeneralSettings, HomepageSettings, containerVariants } from '@/features/admin/components/adminSettings';
import { OwlDialog, useOwlDialog } from '@/shared/ui/common';

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('homepage');
    const [isDirty, setDirty] = useState(false); // check if unsaved changes exist
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();

    const tabs = [
        { id: 'general', label: 'Cài đặt chung', icon: SettingsIcon },
        { id: 'homepage', label: 'Trang chủ', icon: Layout },
        { id: 'emails', label: 'Email system', icon: Mail },
        { id: 'security', label: 'Bảo mật', icon: ShieldCheck },
        { id: 'system', label: 'Hệ thống', icon: Server },
    ];

    const handleTabChange = (tabId) => {
        if (isDirty) {
            openDialog({
                variant: 'warning',
                title: 'Bạn còn thay đổi chưa lưu',
                message: 'Cú phát hiện bạn vẫn đang chỉnh sửa nội dung trong tab hiện tại.',
                details: 'Nếu chuyển tab bây giờ, các thay đổi chưa lưu sẽ bị bỏ qua.',
                showCancel: true,
                confirmLabel: 'Chuyển tab',
                cancelLabel: 'Ở lại chỉnh sửa',
                confirmTone: 'warning',
                onConfirm: () => {
                    setDirty(false);
                    setActiveTab(tabId);
                },
            });
        } else {
            setActiveTab(tabId);
        }
    };

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[1600px] mx-auto space-y-6"
            >
                {/* ===== HEADER ===== */}
                <motion.div className="mb-6">
                    <h1 className="text-2xl lg:text-3xl font-black text-base-content flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-blue-500" />
                        Cài đặt Hệ thống
                    </h1>
                    <p className="text-sm text-base-content/60 mt-2 max-w-2xl leading-relaxed">
                        Quản lý toàn bộ cấu hình lõi của ứng dụng. Vui lòng cẩn trọng khi sửa đổi nội dung ở đây vì nó ảnh hưởng trực tiếp tới toàn bộ người dùng public và luồng hoạt động chính.
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: TABS (Sidebar) */}
                    <div className="lg:w-64 flex-shrink-0">
                        <ul className="menu bg-base-100/50 rounded-2xl p-3 border border-base-200/50 gap-1.5 shadow-sm sticky top-6">
                            {tabs.map(tab => (
                                <li key={tab.id}>
                                    <button
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`gap-3 font-bold rounded-xl py-3 px-4 transition-all ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20 active:bg-blue-600 focus:bg-blue-600'
                                            : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                                            }`}
                                    >
                                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : ''}`} />
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: CONTENT CONFIG */}
                    <div className="flex-1 min-w-0">
                        <div className={activeTab === 'general' ? 'block' : 'hidden'}>
                            <GeneralSettings />
                        </div>
                        <div className={activeTab === 'homepage' ? 'block' : 'hidden'}>
                            <HomepageSettings isDirty={isDirty} setDirty={setDirty} />
                        </div>

                        {/* Placeholder for other tabs */}
                        {['emails', 'security', 'system'].includes(activeTab) && (
                            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-12 text-center text-base-content/40 font-bold border-dashed h-[400px] flex items-center justify-center flex-col gap-4">
                                <Server className="w-12 h-12 opacity-20" />
                                Modul đang được xây dựng ({tabTitleFromId(tabs, activeTab)})
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <OwlDialog
                isOpen={dialog.isOpen}
                variant={dialog.variant}
                title={dialog.title}
                message={dialog.message}
                details={dialog.details}
                confirmLabel={dialog.confirmLabel}
                cancelLabel={dialog.cancelLabel}
                showCancel={dialog.showCancel}
                confirmTone={dialog.confirmTone}
                loading={dialog.loading}
                onClose={closeDialog}
                onConfirm={handleDialogConfirm}
            />
        </AdminLayout>
    );
}

function tabTitleFromId(tabs, id) {
    const r = tabs.find(t => t.id === id);
    return r ? r.label : id;
}


