import React, { useState } from 'react';
import { Mail, Lock, Brain, Eye, EyeOff, Sparkles, HelpCircle, Database, Share2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2 hover:-translate-y-1 transition-transform duration-300">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
        </div>
    </div>
);

const InputField = ({ label, type, placeholder, icon: Icon, isPassword = false }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="form-control w-full">
            <label className="label">
                <span className="label-text font-medium text-slate-700">{label}</span>
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icon className="w-5 h-5" />
                </div>
                <input
                    type={inputType}
                    placeholder={placeholder}
                    className="input input-bordered w-full pl-10 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                />
                {isPassword && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default function Login() {
    return (
        <div className="min-h-screen w-full flex bg-slate-50 font-['Lexend']">

            {/* Left Column - Brand Content */}
            <div className="hidden lg:flex lg:w-3/5 bg-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="z-10 space-y-8 max-w-lg mx-auto mt-10">
                    {/* Logo Area (Optional if needed here) */}
                    <div className="flex items-center gap-2 mb-8">

                        <a className="btn btn-ghost text-2xl font-bold gap-2">
                            <Brain className="w-8 h-8 text-blue-600" />
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-['Lexend']">
                                SKR
                            </span>
                        </a>
                    </div>


                    {/* Feature Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <FeatureCard
                            icon={Sparkles}
                            title="AI Thông minh"
                            description="Tự động tạo câu hỏi từ tài liệu của bạn."
                        />
                        <FeatureCard
                            icon={HelpCircle}
                            title="Trắc nghiệm"
                            description="Luyện tập đa dạng các hình thức câu hỏi."
                        />
                        <FeatureCard
                            icon={Database}
                            title="Quản lý kho"
                            description="Lưu trữ ngân hàng câu hỏi tập trung."
                        />
                        <FeatureCard
                            icon={Share2}
                            title="Chia sẻ"
                            description="Học tập cùng cộng đồng thông minh."
                        />
                    </div>
                </div>

                {/* Decorative Image */}
                <div className="mt-8 rounded-3xl overflow-hidden shadow-xl mx-auto w-full max-w-lg aspect-video relative">
                    <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80"
                        alt="Students Collaboration"
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
                </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-6 relative">
                {/* Background Decoration for Right Side */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-tr-full -z-10 opacity-50"></div>

                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-slate-100">

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Đăng nhập tài khoản</h2>
                        <p className="text-slate-500">Tham gia ngay để trải nghiệm học tập AI</p>
                    </div>

                    <form className="space-y-5">
                        <InputField
                            label="Email"
                            type="email"
                            placeholder="example@gmail.com"
                            icon={Mail}
                        />

                        <InputField
                            label="Mật khẩu"
                            isPassword={true}
                            placeholder="••••••••"
                            icon={Lock}
                        />

                        <div className="flex items-center justify-between">
                            <label className="cursor-pointer label justify-start gap-3 p-0">
                                <input type="checkbox" className="checkbox checkbox-sm checkbox-primary rounded-md" />
                                <span className="label-text text-slate-500 text-xs">
                                    Tôi đồng ý với <a href="#" className="text-blue-600 hover:underline">Điều khoản</a> và <a href="#" className="text-blue-600 hover:underline">Chính sách</a>
                                </span>
                            </label>
                        </div>

                        <button className="btn w-full bg-[#1d72ed] hover:bg-blue-600 text-white rounded-xl shadow-lg border-none text-lg normal-case font-bold group">
                            Đăng nhập
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="divider text-slate-400 text-sm">Hoặc tiếp tục với</div>

                        <button className="btn w-full btn-outline border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-xl normal-case font-medium flex items-center gap-3">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            Tiếp tục với Google
                        </button>
                    </form>

                    <p className="text-center mt-8 text-sm text-slate-600">
                        Bạn chưa có tài khoản? <Link to="/signup" className="text-[#1d72ed] font-bold hover:underline">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
