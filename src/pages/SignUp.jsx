import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail,
    UserPen,
    Lock,
    RotateCcw,
    Brain,
    Eye,
    EyeOff,
    Sparkles,
    HelpCircle,
    Database,
    Share2,
    ArrowRight
} from 'lucide-react';

/* ================== Small Components ================== */

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

const InputField = ({
    label,
    type = 'text',
    placeholder,
    icon: Icon,
    isPassword = false,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="form-control w-full">
            <label className="label">
                <span className="label-text font-medium text-slate-700">{label}</span>
            </label>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Icon className="w-5 h-5" />
                </div>

                <input
                    type={inputType}
                    placeholder={placeholder}
                    className="input input-bordered w-full pl-10 bg-slate-50 focus:bg-white focus:border-blue-500 rounded-xl transition-all"
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
        </div>
    );
};

/* ================== Main Component ================== */

export default function SignUp() {
    return (
        <div className="min-h-screen w-full flex bg-slate-50 font-['Lexend']">

            {/* LEFT SIDE */}
            <div className="hidden lg:flex lg:w-3/5 bg-white p-12 flex-col justify-between">
                <div className="space-y-8 max-w-lg mx-auto mt-10">

                    <div className="flex items-center gap-2">
                        <Brain className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            SKR
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <FeatureCard
                            icon={Sparkles}
                            title="AI Thông minh"
                            description="Tự động tạo câu hỏi từ tài liệu của bạn."
                        />
                        <FeatureCard
                            icon={HelpCircle}
                            title="Trắc nghiệm"
                            description="Luyện tập nhiều dạng câu hỏi."
                        />
                        <FeatureCard
                            icon={Database}
                            title="Ngân hàng"
                            description="Quản lý câu hỏi tập trung."
                        />
                        <FeatureCard
                            icon={Share2}
                            title="Chia sẻ"
                            description="Học tập cùng cộng đồng."
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">Đăng ký tài khoản</h2>
                        <p className="text-slate-500 mt-1">
                            Bắt đầu hành trình học tập cùng AI
                        </p>
                    </div>

                    <form className="space-y-5">
                        <InputField
                            label="Họ và tên"
                            placeholder="Nguyễn Văn A"
                            icon={UserPen}
                        />

                        <InputField
                            label="Email"
                            type="email"
                            placeholder="example@gmail.com"
                            icon={Mail}
                        />

                        <InputField
                            label="Mật khẩu"
                            placeholder="••••••••"
                            icon={Lock}
                            isPassword
                        />

                        <InputField
                            label="Xác nhận mật khẩu"
                            placeholder="••••••••"
                            icon={RotateCcw}
                            isPassword
                        />

                        <label className="flex items-center gap-2 text-xs text-slate-500">
                            <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
                            Tôi đồng ý với Điều khoản & Chính sách
                        </label>

                        <button className="btn w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                            Đăng ký ngay
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm text-slate-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-blue-600 font-bold hover:underline">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
