import { useState } from 'react';
import {
    CreditCard,
    Wallet,
    Building2,
    Smartphone,
    Hash,
    Calendar,
    ShieldCheck,
    Copy,
    CheckCircle2,
} from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency, formatDate, getPaymentMethodLabel } from './utils';

function PaymentMethodIcon({ method, className }) {
    switch (method) {
        case 'momo':
        case 'zalopay':
            return <Wallet className={className} />;
        case 'bank_transfer':
            return <Building2 className={className} />;
        case 'sepay':
            return <Smartphone className={className} />;
        case 'vnpay':
        case 'visa':
        default:
            return <CreditCard className={className} />;
    }
}

export default function TransactionInfo({ transaction, order }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!transaction) return null;

    return (
        <div className="bg-base-100 rounded-2xl border border-base-300 p-6 shadow-sm">
            <h3 className="text-base font-black text-base-content mb-5 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Thông Tin Thanh Toán
            </h3>

            <div className="bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-xl p-4 mb-5 border border-blue-500/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-base-100 flex items-center justify-center shadow-sm border border-base-200">
                        <PaymentMethodIcon method={transaction.paymentMethod} className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-base-content">
                            {getPaymentMethodLabel(transaction.paymentMethod)}
                        </p>
                        <p className="text-xs text-base-content/40 font-medium">
                            Phuong th?c thanh toán
                        </p>
                    </div>
                    <OrderStatusBadge status={transaction.status} size="sm" />
                </div>
            </div>

            <div className="space-y-3">
                <InfoRow
                    icon={Hash}
                    label="Mã giao d?ch"
                    value={transaction.transactionRef}
                    action={
                        <button
                            onClick={() => handleCopy(transaction.transactionRef)}
                            className="btn btn-ghost btn-xs rounded-lg"
                            title="Sao chép"
                        >
                            {copied
                                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                : <Copy className="w-3.5 h-3.5" />
                            }
                        </button>
                    }
                />

                <InfoRow
                    icon={CreditCard}
                    label="S? ti?n thanh toán"
                    value={formatCurrency(transaction.amount)}
                    valueClass="font-black text-emerald-600"
                />

                <InfoRow
                    icon={Calendar}
                    label="Th?i gian thanh toán"
                    value={formatDate(transaction.createdAt, true)}
                />

                <InfoRow
                    icon={ShieldCheck}
                    label="B?o m?t"
                    value="Giao d?ch du?c mã hóa SSL 256-bit"
                    valueClass="text-emerald-600"
                />
            </div>

            {order && (
                <div className="mt-5 pt-5 border-t border-base-200 space-y-2.5">
                    <PriceRow label="T?ng ti?n hàng" value={formatCurrency(order.totalAmount)} />

                    {order.discountAmount > 0 && (
                        <PriceRow
                            label={`Gi?m giá ${order.couponCode ? `(${order.couponCode})` : ''}`}
                            value={`-${formatCurrency(order.discountAmount)}`}
                            valueClass="text-emerald-600"
                        />
                    )}

                    <div className="pt-2.5 border-t border-base-200">
                        <PriceRow
                            label="Thành ti?n"
                            value={formatCurrency(order.finalAmount)}
                            bold
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ icon: Icon, label, value, valueClass = '', action }) {
    return (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 text-base-content/30 flex-shrink-0" />
                <span className="text-xs text-base-content/50 font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className={`text-sm font-semibold text-base-content ${valueClass}`}>
                    {value}
                </span>
                {action}
            </div>
        </div>
    );
}

function PriceRow({ label, value, valueClass = '', bold = false }) {
    return (
        <div className="flex items-center justify-between">
            <span className={`text-sm ${bold ? 'font-bold text-base-content' : 'text-base-content/60 font-medium'}`}>
                {label}
            </span>
            <span className={`text-sm ${bold ? 'text-lg font-black text-base-content' : `font-bold text-base-content ${valueClass}`}`}>
                {value}
            </span>
        </div>
    );
}

