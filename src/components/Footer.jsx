import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Brain } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-50 pt-16 pb-8 border-t border-slate-200 text-slate-600">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h2 className="flex items-center gap-2 text-2xl font-bold font-['Lexend'] bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            <Brain className="w-6 h-6 text-blue-600" />
                            ReviseHub
                        </h2>
                        <p className="text-sm leading-relaxed">
                            Nâng tầm kiến thức Việt bằng công nghệ AI tiên phong.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Facebook className="w-5 h-5 hover:text-blue-600 cursor-pointer transition-colors" />
                            <Twitter className="w-5 h-5 hover:text-blue-400 cursor-pointer transition-colors" />
                            <Instagram className="w-5 h-5 hover:text-pink-600 cursor-pointer transition-colors" />
                            <Linkedin className="w-5 h-5 hover:text-blue-700 cursor-pointer transition-colors" />
                        </div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Nền tảng</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Thư viện Flashcard</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Lộ trình học AI</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Kho đề thi thử</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Dành cho Giáo viên</a></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Hỗ trợ</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Trung tâm trợ giúp</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Hướng dẫn sử dụng</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Báo cáo lỗi</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Liên hệ</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Tham gia ngay</h3>
                        <p className="text-sm mb-4">Để lại email để nhận các mẹo học tập hiệu quả nhất.</p>
                        <div className="join w-full">
                            <input className="input input-bordered join-item w-full input-sm" placeholder="Email của bạn" />
                            <button className="btn btn-primary join-item btn-sm bg-blue-600 border-none">Đăng ký</button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p>© 2026 ReviseHub. All rights reserved. Made for future leaders.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-900">Điều khoản</a>
                        <a href="#" className="hover:text-slate-900">Bảo mật</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
