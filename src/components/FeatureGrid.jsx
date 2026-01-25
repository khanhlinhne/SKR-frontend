import React from 'react';
import { Zap, Shield, TrendingUp } from 'lucide-react';

const features = [
    {
        icon: <Zap className="w-6 h-6 text-yellow-500" />,
        title: "Tạo bài học tức thì",
        description: "AI tự động phân tích và tạo Flashcard, Quiz từ tài liệu PDF, Slide hoặc hình ảnh chỉ trong 5 giây.",
        color: "bg-yellow-50"
    },
    {
        icon: <Shield className="w-6 h-6 text-green-500" />,
        title: "Chuyên gia xác thực",
        description: "Toàn bộ ngân hàng đề thi và giáo trình được kiểm duyệt bởi các giảng viên ĐH uy tín tại Việt Nam.",
        color: "bg-green-50"
    },
    {
        icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
        title: "Làm chủ môn học",
        description: "Lộ trình cá nhân hóa dựa trên mức độ tiếp thu, giúp bạn tiến bộ vượt bậc chỉ sau 2 tuần sử dụng.",
        color: "bg-blue-50"
    }
];

export default function FeatureGrid() {
    return (
        <div className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl lg:text-4xl font-bold font-['Lexend'] text-slate-900">
                        Tại sao chọn ReviseHub?
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Nền tảng học tập kết hợp giữa sức mạnh AI và đội ngũ chuyên gia hàng đầu để mang lại trải nghiệm học tập tốt nhất.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
                            <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 font-['Lexend']">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
