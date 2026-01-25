import React, { useState, useEffect } from 'react';

export default function CountDown() {
    const [timeLeft, setTimeLeft] = useState({
        days: 15,
        hours: 10,
        minutes: 24,
        seconds: 59
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 text-center relative z-10 text-white">
                <h2 className="text-3xl md:text-4xl font-bold font-['Lexend'] mb-4">
                    Ưu đãi đăng ký sớm sẽ kết thúc sau
                </h2>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                    Đăng ký ngay hôm nay để nhận giảm giá 50% trọn đời và truy cập không giới hạn vào kho tài liệu AI.
                </p>

                <div className="grid grid-flow-col gap-4 md:gap-8 text-center auto-cols-max justify-center mb-8">
                    <div className="flex flex-col p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 min-w-[80px] md:min-w-[100px]">
                        <span className="countdown font-mono text-4xl md:text-5xl font-bold">
                            <span style={{ "--value": timeLeft.days }}></span>
                        </span>
                        <span className="text-xs md:text-sm uppercase tracking-widest mt-2 opacity-80">Ngày</span>
                    </div>
                    <div className="flex flex-col p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 min-w-[80px] md:min-w-[100px]">
                        <span className="countdown font-mono text-4xl md:text-5xl font-bold">
                            <span style={{ "--value": timeLeft.hours }}></span>
                        </span>
                        <span className="text-xs md:text-sm uppercase tracking-widest mt-2 opacity-80">Giờ</span>
                    </div>
                    <div className="flex flex-col p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 min-w-[80px] md:min-w-[100px]">
                        <span className="countdown font-mono text-4xl md:text-5xl font-bold">
                            <span style={{ "--value": timeLeft.minutes }}></span>
                        </span>
                        <span className="text-xs md:text-sm uppercase tracking-widest mt-2 opacity-80">Phút</span>
                    </div>
                    <div className="flex flex-col p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 min-w-[80px] md:min-w-[100px]">
                        <span className="countdown font-mono text-4xl md:text-5xl font-bold">
                            <span style={{ "--value": timeLeft.seconds }}></span>
                        </span>
                        <span className="text-xs md:text-sm uppercase tracking-widest mt-2 opacity-80">Giây</span>
                    </div>
                </div>

                <button className="btn btn-lg bg-white text-blue-700 hover:bg-blue-50 border-none rounded-xl px-8 shadow-xl hover:scale-105 transition-transform font-bold">
                    Nhận ưu đãi ngay
                </button>
            </div>
        </div>
    );
}