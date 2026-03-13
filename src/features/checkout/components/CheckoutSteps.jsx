import { motion } from 'motion/react';
import { CheckCircle2, CreditCard, ShoppingCart } from 'lucide-react';

const steps = [
    { id: 1, label: 'Xác nhận', icon: ShoppingCart },
    { id: 2, label: 'Thanh toán', icon: CreditCard },
    { id: 3, label: 'Hoàn tất', icon: CheckCircle2 },
];

export default function CheckoutSteps({ currentStep = 1 }) {
    return (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isDone = currentStep > step.id;

                return (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        className={`inline-flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition-all ${
                            isDone
                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
                                : isActive
                                    ? 'border-sky-500/20 bg-sky-500/10 text-sky-700 shadow-sm'
                                    : 'border-base-200 bg-base-100 text-base-content/45'
                        }`}
                    >
                        <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                isDone
                                    ? 'bg-emerald-500 text-white'
                                    : isActive
                                        ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white'
                                        : 'bg-base-200 text-base-content/40'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                        </span>
                        {step.label}
                    </motion.div>
                );
            })}
        </div>
    );
}
