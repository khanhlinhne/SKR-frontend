import React from 'react';
import { CheckCircle2, Brain } from 'lucide-react';

export default function SmartFeatures() {
    return (
        <div className="py-24 bg-slate-900 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl lg:text-5xl font-bold font-['Lexend'] text-white leading-tight">
                            Trải nghiệm ngay <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                tính năng học thông minh
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Hệ thống AI sẽ tự động điều chỉnh độ khó và tần suất lặp lại để đảm bảo bạn không bao giờ quên kiến thức đã học.
                        </p>

                        <div className="space-y-4">
                            {[
                                "File Flashcard để xem lời giải",
                                "Quiz trắc nghiệm có giải thích chi tiết",
                                "Theo dõi tiến độ theo thời gian thực"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>

                        <button className="btn btn-primary bg-blue-600 border-none hover:bg-blue-500 text-white btn-lg rounded-xl mt-4">
                            Học thử miễn phí ngay
                        </button>
                    </div>

                    <div className="relative">
                        {/* Mock UI Container */}
                        <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-sm relative transform lg:rotate-3 hover:rotate-0 transition-transform duration-500">
                            {/* Header Mock */}
                            <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                                    <Brain className="w-4 h-4 text-purple-400" />
                                    QUESTION #12 - BIOLOGY
                                </div>
                                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                            </div>

                            {/* Question */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Chức năng chính của ti thể (Mitochondria) trong tế bào là gì?</h3>
                                <div className="flex gap-2 mt-4">
                                    <span className="badge badge-outline text-slate-400 border-slate-600">Sinh học</span>
                                    <span className="badge badge-outline text-slate-400 border-slate-600">Khó</span>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer transition-colors flex justify-between items-center group">
                                    <span>A. Tổng hợp Protein</span>
                                    <div className="w-4 h-4 rounded-full border border-slate-500 group-hover:border-blue-400"></div>
                                </div>
                                <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/50 text-green-300 cursor-pointer transition-colors flex justify-between items-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                    <span>B. Sản xuất năng lượng (ATP)</span>
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                </div>
                                <div className="p-4 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer transition-colors flex justify-between items-center group">
                                    <span>C. Lưu trữ thông tin di truyền</span>
                                    <div className="w-4 h-4 rounded-full border border-slate-500 group-hover:border-blue-400"></div>
                                </div>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -z-10 top-10 -right-10 w-full h-full bg-blue-600/20 rounded-2xl transform rotate-6"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
