import React from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';

export default function Hero() {
    return (
        <div className="hero min-h-screen bg-white pt-20">
            <div className="hero-content flex-col lg:flex-row-reverse gap-12 px-4 lg:px-8 max-w-7xl mx-auto">
                <div className="flex-1 relative w-full max-w-xl">
                    {/* Decorative elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

                    {/* Image Placeholder */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-all duration-500">
                        <div className="bg-slate-100 aspect-video flex items-center justify-center relative group cursor-pointer overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80"
                                alt="Học viên đang học"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <PlayCircle className="w-8 h-8 text-blue-600 ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating badges */}
                    <div className="absolute -bottom-6 right-8 bg-white p-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce duration-[3000ms]">
                        <div className="avatar -space-x-2">
                            <div className="w-8 rounded-full border-2 border-white">
                                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt="Avatar" />
                            </div>
                            <div className="w-8 rounded-full border-2 border-white">
                                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt="Avatar" />
                            </div>
                        </div>
                        <div className="text-xs font-semibold text-slate-700">
                            <p>10k+ Học viên</p>
                            <p className="text-yellow-500">★★★★★</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 text-center lg:text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100 mb-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        #1 Nền tảng học tập AI
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight font-['Lexend'] text-slate-900">
                        Làm chủ kiến thức với <br />
                        <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                            công nghệ AI
                        </span>
                    </h1>

                    <p className="py-4 text-slate-600 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                        Tự động tạo Flashcards, Quiz từ tài liệu của bạn trong giây lát. Hệ thống ôn tập Spaced Repetition tối ưu giúp bạn ghi nhớ lâu hơn 300%.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button className="btn btn-lg bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl px-8 shadow-xl shadow-blue-600/30 group">
                            Bắt đầu ôn tập ngay
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="btn btn-lg btn-ghost border-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                            Xem demo
                        </button>
                    </div>

                    <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Fake Logos */}
                        <span className="text-xl font-bold font-serif">Harvard</span>
                        <span className="text-xl font-bold font-sans">MIT</span>
                        <span className="text-xl font-bold font-mono">Stanford</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
