import { motion } from 'motion/react';
import {
    CreditCard,
    Smartphone,
    Landmark,
    Wallet,
    Shield,
    CheckCircle2,
} from 'lucide-react';

/**
 * PaymentMethods — maps to payment_transactions.payment_method
 * Supported: 'momo', 'vnpay', 'zalopay', 'bank_transfer', 'credit_card'
 */
const methods = [
    {
        id: 'momo',
        name: 'Ví MoMo',
        description: 'Thanh toán qua ví điện tử MoMo',
        icon: Smartphone,
        color: 'from-pink-500 to-rose-500',
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-600',
        popular: true,
    },
    {
        id: 'vnpay',
        name: 'VNPay',
        description: 'Thanh toán qua cổng VNPay',
        icon: Wallet,
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        popular: true,
    },
    {
        id: 'zalopay',
        name: 'ZaloPay',
        description: 'Thanh toán qua ví ZaloPay',
        icon: Smartphone,
        color: 'from-blue-600 to-indigo-600',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600',
        popular: false,
    },
    {
        id: 'bank_transfer',
        name: 'Chuyển khoản ngân hàng',
        description: 'Chuyển khoản qua Internet Banking',
        icon: Landmark,
        color: 'from-emerald-500 to-green-500',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        popular: false,
    },
    {
        id: 'credit_card',
        name: 'Thẻ Visa / Mastercard',
        description: 'Thanh toán bằng thẻ quốc tế',
        icon: CreditCard,
        color: 'from-violet-500 to-purple-500',
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-600',
        popular: false,
    },
];

export default function PaymentMethods({ selected, onSelect }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-violet-500" />
                <h3 className="text-base font-black text-base-content">Phương thức thanh toán</h3>
            </div>

            <div className="grid gap-3">
                {methods.map((method, i) => {
                    const isSelected = selected === method.id;
                    const Icon = method.icon;

                    return (
                        <motion.button
                            key={method.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => onSelect(method.id)}
                            className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300 ${isSelected
                                    ? 'border-violet-500 bg-violet-500/5 shadow-lg shadow-violet-500/10'
                                    : 'border-base-200 bg-base-100 hover:border-base-300 hover:bg-base-200/30'
                                }`}
                        >
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected
                                    ? `bg-gradient-to-br ${method.color} text-white shadow-md`
                                    : `${method.bgColor} ${method.textColor}`
                                } transition-all duration-300`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${isSelected ? 'text-violet-700' : 'text-base-content'}`}>
                                        {method.name}
                                    </span>
                                    {method.popular && (
                                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold uppercase">
                                            Phổ biến
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-base-content/50 font-medium mt-0.5">
                                    {method.description}
                                </p>
                            </div>

                            {/* Radio indicator */}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                                    ? 'border-violet-500 bg-violet-500'
                                    : 'border-base-300'
                                }`}>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', bounce: 0.5 }}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Security badge */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 mt-2"
            >
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700">
                    Mọi giao dịch được mã hóa SSL 256-bit. Thông tin thanh toán của bạn luôn an toàn.
                </span>
            </motion.div>
        </div>
    );
}

