import * as motion from 'motion/react-client';
import { ShoppingCart, CreditCard, CheckCircle2 } from 'lucide-react';

const steps = [
    { id: 1, label: 'Xác nhận đơn hàng', icon: ShoppingCart },
    { id: 2, label: 'Thanh toán', icon: CreditCard },
    { id: 3, label: 'Hoàn tất', icon: CheckCircle2 },
];

export default function CheckoutSteps({ currentStep = 1 }) {
    return (
        <div className="flex items-center justify-center gap-0 w-full max-w-2xl mx-auto mb-10">
            {steps.map((step, i) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const Icon = step.icon;

                return (
                    <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                        {/* Step circle + label */}
                        <div className="flex flex-col items-center gap-2 relative">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.15, type: 'spring', bounce: 0.4 }}
                                className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${isCompleted
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25'
                                        : isActive
                                            ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-600/25'
                                            : 'bg-base-200 text-base-content/40'
                                    }`}
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', bounce: 0.5 }}
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}

                                {/* Pulse ring for active step */}
                                {isActive && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-violet-500"
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                )}
                            </motion.div>
                            <span className={`text-xs font-bold whitespace-nowrap transition-colors duration-300 ${isActive
                                    ? 'text-violet-600'
                                    : isCompleted
                                        ? 'text-emerald-600'
                                        : 'text-base-content/40'
                                }`}>
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div className="flex-1 h-[2px] mx-3 mt-[-24px] bg-base-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                                    initial={{ width: '0%' }}
                                    animate={{ width: isCompleted ? '100%' : '0%' }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
