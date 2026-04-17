import { motion } from 'motion/react';
import { cardVariants } from './constants';
import { Save, Globe, Type, Image as ImageIcon } from 'lucide-react';

export default function GeneralSettings() {
    return (
        <motion.div variants={cardVariants} className="space-y-6">
            {/* Header section (fake) */}
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
                <div className="px-6 py-4 border-b border-base-300 flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-black text-base-content">Cài đặt chung hệ thống</h3>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-base-content/70">Tên website</span>
                            </label>
                            <input type="text" defaultValue="SKR Learning" className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors" />
                            <label className="label">
                                <span className="label-text-alt text-base-content/50">Tên hiển thị trên các trang công khai</span>
                            </label>
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-base-content/70">Email liên hệ</span>
                            </label>
                            <input type="email" defaultValue="support@skr-learning.vn" className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors" />
                        </div>
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-bold text-base-content/70">Mô tả ngắn (SEO)</span>
                        </label>
                        <textarea className="textarea textarea-bordered h-24 bg-base-200/50 focus:bg-base-100 transition-colors" defaultValue="SKR Learning - Nền tảng ôn thi và học tập thông minh dựa trên AI." />
                    </div>

                    <div className="flex items-center justify-end pt-4 border-t border-base-200">
                        <button className="btn bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none shadow-lg shadow-blue-500/20 font-bold px-8">
                            <Save className="w-4 h-4 mr-2" />
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
