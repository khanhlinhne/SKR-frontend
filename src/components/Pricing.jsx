import React from 'react';
import { Check } from 'lucide-react';

const plans = [
    {
        name: "Cá nhân (Basic)",
        price: "Free",
        period: "",
        desc: "Dành cho người mới bắt đầu",
        features: [
            "5 bộ Flashcard mỗi tháng",
            "Truy cập thư viện cộng đồng",
            "Không có AI tạo đề"
        ],
        cta: "Bắt đầu ngay",
        bordered: false
    },
    {
        name: "Học chuyên sâu (Pro)",
        price: "99.000đ",
        period: "/tháng",
        desc: "Dành cho ôn thi cấp tốc",
        features: [
            "Không giới hạn Flashcard AI",
            "Mọi tài liệu từ Chuyên gia",
            "Chế độ ôn tập Offline",
            "Phân tích lỗ hổng chi tiết"
        ],
        cta: "Nâng cấp Pro",
        highlight: true,
        bordered: true
    },
    {
        name: "Đội nhóm (Premium)",
        price: "249.000đ",
        period: "/tháng",
        desc: "Dành cho nhóm học tập",
        features: [
            "Tối đa 5 tài khoản liên kết",
            "Thư viện nội bộ của nhóm",
            "Báo cáo tiến độ cho Team"
        ],
        cta: "Liên hệ ngay",
        bordered: false
    }
];

export default function Pricing() {
    return (
        <div className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl lg:text-4xl font-bold font-['Lexend'] text-slate-900">
                        Gói dịch vụ linh hoạt
                    </h2>
                    <p className="text-slate-600">Chọn gói phù hợp với mục tiêu học tập của bạn.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
                    {plans.map((plan, idx) => (
                        <div key={idx} className={`relative bg-white rounded-2xl p-8 shadow-lg ${plan.highlight ? 'scale-110 z-10 border-2 border-purple-500 shadow-purple-200' : 'border border-slate-100'}`}>
                            {plan.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                                    Khuyên dùng
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{plan.name}</h3>
                            <p className="text-slate-500 text-sm mb-6">{plan.desc}</p>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                <span className="text-slate-500 ml-1">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feat, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-3 text-slate-600 text-sm">
                                        <Check className={`w-4 h-4 ${plan.highlight ? 'text-purple-600' : 'text-green-500'}`} />
                                        {feat}
                                    </div>
                                ))}
                            </ul>

                            <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.highlight
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-600 hover:text-blue-600'
                                }`}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
