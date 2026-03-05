import { useState } from 'react';
import * as motion from 'motion/react-client';
import { cardVariants } from './constants';
import {
    Save, Image as ImageIcon, Type, MousePointerClick, Star, LayoutTemplate,
    Sparkles, RefreshCw, Eye, Monitor, Smartphone, Maximize2, Edit2, X
} from 'lucide-react';

import { NavBar, Footer } from '../../layout';
import {
    Hero,
    SmartFeatures,
    FeaturesSection,
    AudienceSection,
    ExpertCoursesSection,
    PricingSection,
    BlogSection,
    CTASection
} from '../../homepage';

export default function HomepageSettings({ isDirty, setDirty }) {
    const loadInitialState = (key, defaultData) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultData;
        } catch {
            return defaultData;
        }
    };

    // Fake local state for fields
    const [heroData, setHeroData] = useState(() => loadInitialState('skr_homepage_hero', {
        badge: 'AI-Powered Learning Revolution',
        titleMain: 'Smart Knowledge',
        titleHighlight: 'Revise System',
        subtitle: 'Hệ thống học tập thông minh tích hợp AI giúp cá nhân hóa lộ trình ôn thi, tự động tạo nội dung và phân tích điểm yếu để tối ưu kết quả học tập của bạn.',
        ctaPrimaryText: 'Bắt đầu miễn phí',
        ctaSecondaryText: 'Khám phá tính năng AI',
        heroImage: 'https://i.pinimg.com/736x/05/d7/84/05d784805e083785e14d8555d9428c1b.jpg'
    }));

    const [featuresData, setFeaturesData] = useState(() => loadInitialState('skr_homepage_features', {
        badge: 'Tính năng nổi bật',
        titleMain: 'Tất cả những gì bạn cần',
        titleHighlight: 'để thành công',
        subtitle: 'Smart Knowledge Revise mang đến trải nghiệm học tập hiện đại, thông minh và hiệu quả với công nghệ AI tiên tiến nhất.'
    }));

    const [expertsData, setExpertsData] = useState(() => loadInitialState('skr_homepage_experts', {
        badge: 'Chuyên gia hàng đầu',
        titleMain: 'Học tập cùng',
        titleHighlight: 'Chuyên gia',
        subtitle: 'Khám phá kho tàng kiến thức được xây dựng bởi các giảng viên, tiến sĩ và chuyên gia hàng đầu, kèm theo hệ thống Flashcard thông minh giúp bạn ghi nhớ lâu dài.'
    }));

    const [activeModal, setActiveModal] = useState(null);

    const handleChange = (e, section, field) => {
        if (section === 'hero') setHeroData({ ...heroData, [field]: e.target.value });
        if (section === 'features') setFeaturesData({ ...featuresData, [field]: e.target.value });
        if (section === 'experts') setExpertsData({ ...expertsData, [field]: e.target.value });
        setDirty(true);
    };

    const handleSaveConfig = () => {
        try {
            localStorage.setItem('skr_homepage_hero', JSON.stringify(heroData));
            localStorage.setItem('skr_homepage_features', JSON.stringify(featuresData));
            localStorage.setItem('skr_homepage_experts', JSON.stringify(expertsData));
            setDirty(false);
            alert('Lưu thay đổi thành công! Bản nháp đã được Live trên trang chủ.');
        } catch (error) {
            console.error('Error saving homepage config:', error);
            alert('Có lỗi xảy ra khi lưu! Hãy thử lại.');
        }
    };

    const SectionOverlay = ({ id, name, children }) => (
        <div className="relative group/section">
            <div className="absolute top-4 right-4 z-[60] opacity-0 group-hover/section:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => setActiveModal(id)}
                    className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none shadow-2xl shadow-blue-500/50 gap-2 rounded-xl"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                    Tùy chỉnh {name}
                </button>
            </div>
            <div className="absolute inset-0 z-[50] border-2 border-transparent group-hover/section:border-blue-500/50 hover:bg-blue-500/5 pointer-events-none transition-all duration-300 rounded-2xl" />
            <div className="relative z-10" style={{ pointerEvents: 'none' }}>
                {children}
            </div>
        </div>
    );

    return (
        <motion.div variants={cardVariants} className="h-full flex flex-col gap-6 relative">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-base-200">
                <div className="mb-4 sm:mb-0">
                    <h2 className="text-2xl font-black text-base-content flex items-center gap-2">
                        <LayoutTemplate className="w-7 h-7 text-blue-500" />
                        Live Website Builder
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">
                        Di chuột qua khối nội dung bên dưới và nhấn "Tùy chỉnh" để sửa trực tiếp.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSaveConfig}
                        className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none shadow-lg gap-1.5 rounded-xl font-bold px-6 h-10"
                    >
                        <Save className="w-4 h-4" /> Lưu Layout
                    </button>
                </div>
            </div>

            {/* FULL WIDTH PREVIEW CONTAINER */}
            <div className="w-full bg-base-300 rounded-3xl overflow-hidden border border-base-300 shadow-inner relative flex flex-col h-[75vh]">
                {/* Fake Browser Toolbar */}
                <div className="h-12 bg-base-200 border-b border-base-300 flex items-center justify-between px-4 z-[70] shrink-0">
                    <div className="flex gap-1.5 w-16">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="bg-base-100 px-4 py-1.5 rounded-lg text-xs font-mono text-base-content/50 w-full max-w-sm flex items-center justify-center gap-2 border border-base-300 shadow-sm truncate">
                        <span className="opacity-50 text-[10px]">https://</span>
                        skr-learning.vn
                    </div>
                    <div className="flex gap-2 w-16 justify-end">
                        <button className="hover:text-blue-500 transition-colors"><Monitor className="w-4 h-4 text-base-content/70" /></button>
                        <button className="hover:text-blue-500 transition-colors"><Smartphone className="w-4 h-4 text-base-content/40" /></button>
                    </div>
                </div>

                {/* Actual live preview iframe-like container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-base-100" style={{ transform: 'translateZ(0)' }}>
                    {/* Rendering the actual homepage components directly! */}
                    <div className="w-full font-sans bg-base-100 origin-top overflow-x-hidden min-h-[100%]">

                        <div style={{ pointerEvents: 'none' }}>
                            <NavBar />
                        </div>

                        <SectionOverlay id="hero" name="Hero Banner">
                            <Hero {...heroData} />
                        </SectionOverlay>

                        <div style={{ pointerEvents: 'none' }}>
                            <SmartFeatures />
                        </div>

                        <SectionOverlay id="features" name="Tính năng nổi bật">
                            <FeaturesSection {...featuresData} />
                        </SectionOverlay>

                        <div style={{ pointerEvents: 'none' }}>
                            <AudienceSection />
                        </div>

                        <SectionOverlay id="experts" name="Chuyên gia">
                            <ExpertCoursesSection {...expertsData} />
                        </SectionOverlay>

                        <div style={{ pointerEvents: 'none' }}>
                            <PricingSection />
                            <BlogSection />
                            <CTASection />
                            <Footer />
                        </div>

                    </div>
                </div>
            </div>

            {/* MODAL - For Editing */}
            {activeModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-base-300/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-base-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10 border border-base-200"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-base-200 bg-base-100">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-blue-500" />
                                {activeModal === 'hero' ? 'Tùy chỉnh Hero Banner' :
                                    activeModal === 'features' ? 'Tùy chỉnh Tính năng' :
                                        'Tùy chỉnh Chuyên gia'}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="btn btn-sm btn-circle btn-ghost">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 bg-base-50/50">
                            {/* --- HERO FORM --- */}
                            {activeModal === 'hero' && (
                                <>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-bold">Badge Nổi bật</span></label>
                                        <input type="text" value={heroData.badge} onChange={(e) => handleChange(e, 'hero', 'badge')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-medium" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-bold">Tiêu đề chính</span></label>
                                            <input type="text" value={heroData.titleMain} onChange={(e) => handleChange(e, 'hero', 'titleMain')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-bold" />
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-bold text-violet-500">Từ khóa bôi màu</span></label>
                                            <input type="text" value={heroData.titleHighlight} onChange={(e) => handleChange(e, 'hero', 'titleHighlight')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-bold text-violet-600" />
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-bold">Đoạn mô tả</span></label>
                                        <textarea value={heroData.subtitle} onChange={(e) => handleChange(e, 'hero', 'subtitle')} className="textarea h-24 bg-base-100 border-base-300 shadow-sm rounded-xl font-medium py-3" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-bold">Nút chính (CTA)</span></label>
                                            <input type="text" value={heroData.ctaPrimaryText} onChange={(e) => handleChange(e, 'hero', 'ctaPrimaryText')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-medium" />
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-bold">Nút phụ</span></label>
                                            <input type="text" value={heroData.ctaSecondaryText} onChange={(e) => handleChange(e, 'hero', 'ctaSecondaryText')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-medium" />
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-bold">Link Ảnh / Minh họa</span></label>
                                        <input type="text" value={heroData.heroImage} onChange={(e) => handleChange(e, 'hero', 'heroImage')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-mono text-xs" />
                                    </div>
                                </>
                            )}

                            {/* --- FEATURES FORM --- */}
                            {activeModal === 'features' && (
                                <>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-bold">Badge Nổi bật</span></label>
                                        <input type="text" value={featuresData.badge} onChange={(e) => handleChange(e, 'features', 'badge')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-medium" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-bold">Tiêu đề chính</span></label>
                                            <input type="text" value={featuresData.titleMain} onChange={(e) => handleChange(e, 'features', 'titleMain')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-bold" />
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-bold text-violet-500">Từ khóa bôi màu</span></label>
                                            <input type="text" value={featuresData.titleHighlight} onChange={(e) => handleChange(e, 'features', 'titleHighlight')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-bold text-violet-600" />
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-bold">Đoạn mô tả</span></label>
                                        <textarea value={featuresData.subtitle} onChange={(e) => handleChange(e, 'features', 'subtitle')} className="textarea h-24 bg-base-100 border-base-300 shadow-sm rounded-xl font-medium py-3" />
                                    </div>
                                </>
                            )}

                            {/* --- EXPERTS FORM --- */}
                            {activeModal === 'experts' && (
                                <>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-bold">Badge Nổi bật</span></label>
                                        <input type="text" value={expertsData.badge} onChange={(e) => handleChange(e, 'experts', 'badge')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-medium" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-bold">Tiêu đề chính</span></label>
                                            <input type="text" value={expertsData.titleMain} onChange={(e) => handleChange(e, 'experts', 'titleMain')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-bold" />
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-bold text-violet-500">Từ khóa bôi màu</span></label>
                                            <input type="text" value={expertsData.titleHighlight} onChange={(e) => handleChange(e, 'experts', 'titleHighlight')} className="input h-10 w-full bg-base-100 border-base-300 shadow-sm rounded-xl font-bold text-violet-600" />
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-bold">Đoạn mô tả</span></label>
                                        <textarea value={expertsData.subtitle} onChange={(e) => handleChange(e, 'experts', 'subtitle')} className="textarea h-24 bg-base-100 border-base-300 shadow-sm rounded-xl font-medium py-3" />
                                    </div>

                                    <div className="mt-4 p-4 border border-base-300 bg-base-100 rounded-xl space-y-2">
                                        <div className="text-sm font-bold text-base-content">Ghim khóa học nổi bật:</div>
                                        {['Toán Cao Cấp', 'IELTS Academic - 7.0+', 'Python & AI - Ứng dụng'].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <input type="checkbox" defaultChecked className="checkbox checkbox-sm checkbox-primary" />
                                                <span className="text-sm font-medium">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-4 border-t border-base-200 bg-base-100 flex justify-end gap-3 z-10">
                            <button onClick={() => setActiveModal(null)} className="btn btn-ghost rounded-xl font-bold">Đóng</button>
                            {/* Nút lưu để đóng modal, state đã thay đổi rồi */}
                            <button onClick={() => setActiveModal(null)} className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg rounded-xl font-bold px-6">Áp dụng</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
