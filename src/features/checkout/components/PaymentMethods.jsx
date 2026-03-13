import { motion } from 'motion/react';
import {
    CheckCircle2,
    CreditCard,
    Landmark,
    Shield,
    Smartphone,
    Wallet,
} from 'lucide-react';

const methods = [
    {
        id: 'momo',
        name: 'Ví MoMo',
        description: 'Thanh toán nhanh bằng ví điện tử MoMo.',
        icon: Smartphone,
        accent: 'from-pink-500 to-rose-500',
    },
    {
        id: 'vnpay',
        name: 'VNPay',
        description: 'Thanh toán qua cổng VNPay.',
        icon: Wallet,
        accent: 'from-sky-500 to-cyan-500',
    },
    {
        id: 'zalopay',
        name: 'ZaloPay',
        description: 'Thanh toán bằng ví ZaloPay.',
        icon: Smartphone,
        accent: 'from-indigo-500 to-blue-600',
    },
    {
        id: 'bank_transfer',
        name: 'Chuyển khoản ngân hàng',
        description: 'Nhận thông tin chuyển khoản để thanh toán thủ công.',
        icon: Landmark,
        accent: 'from-emerald-500 to-green-500',
    },
    {
        id: 'credit_card',
        name: 'Visa / Mastercard',
        description: 'Thanh toán bằng thẻ quốc tế.',
        icon: CreditCard,
        accent: 'from-fuchsia-500 to-violet-500',
    },
];

export default function PaymentMethods({ selected, onSelect }) {
    return (
        <section className="apple-panel apple-card-shadow rounded-[32px] border p-6 sm:p-7">
            <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                Payment method
            </div>
            <h2 className="apple-main-text mt-5 text-3xl font-semibold tracking-[-0.03em]">
                Chọn phương thức thanh toán phù hợp
            </h2>
            <p className="apple-secondary-text mt-3 text-sm leading-7">
                SKR giữ bước này thật ngắn để bạn hoàn tất nhanh, nhưng vẫn đủ rõ ràng về phương thức và độ an toàn.
            </p>

            <div className="mt-6 grid gap-3">
                {methods.map((method, index) => {
                    const Icon = method.icon;
                    const isSelected = selected === method.id;

                    return (
                        <motion.button
                            key={method.id}
                            type="button"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -2 }}
                            onClick={() => onSelect(method.id)}
                            className={`flex items-center gap-4 rounded-[24px] border px-4 py-4 text-left transition-all ${
                                isSelected
                                    ? 'border-sky-500/30 bg-sky-500/8 shadow-sm'
                                    : 'border-white/45 bg-white/75 shadow-sm backdrop-blur-xl'
                            }`}
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${method.accent} text-white shadow-sm`}>
                                <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-base-content">{method.name}</p>
                                <p className="mt-1 text-sm text-base-content/55">{method.description}</p>
                            </div>

                            <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                isSelected ? 'border-sky-500 bg-sky-500 text-white' : 'border-base-300 text-transparent'
                            }`}>
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-emerald-500/15 bg-emerald-500/7 px-4 py-4">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                <p className="text-sm leading-7 text-emerald-800">
                    Mọi giao dịch đều được mã hóa SSL 256-bit. Thông tin thanh toán của bạn không bị hiển thị công khai trong hệ thống học tập.
                </p>
            </div>
        </section>
    );
}
