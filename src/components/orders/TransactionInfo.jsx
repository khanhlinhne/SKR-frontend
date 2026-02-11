import * as motion from 'motion/react-client';
import {
    CreditCard,
    Hash,
    Calendar,
    ShieldCheck,
    Copy,
    CheckCircle2,
    ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency, formatDate, getPaymentMethodLabel, getPaymentMethodIcon } from './utils';

/**
 * TransactionInfo — Hiển thị thông tin giao dịch thanh toán
 * Maps to: transactions table (payment_method, amount, status, transaction_ref, gateway_response)
 * 
 * @param {object} transaction - Transaction data object
 * @param {object} order - Order data for price breakdown
 */
export default function TransactionInfo({ transaction, order }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!transaction) return null;

    const PaymentIcon = getPaymentMethodIcon(transaction.paymentMethod);

    return (
        <div className="bg-base-100 rounded-2xl border border-base-300 p-6 shadow-sm">
            <h3 className="text-base font-black text-base-content mb-5 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Thông Tin Thanh Toán
            </h3>

            {/* Payment method highlight */}
            <div className="bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-xl p-4 mb-5 border border-blue-500/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-base-100 flex items-center justify-center shadow-sm border border-base-200">
                        <PaymentIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-base-content">
                            {getPaymentMethodLabel(transaction.paymentMethod)}
                        </p>
                        <p className="text-xs text-base-content/40 font-medium">
                            Phương thức thanh toán
                        </p>
                    </div>
                    <OrderStatusBadge status={transaction.status} size="sm" />
                </div>
            </div>

            {/* Info rows */}
            <div className="space-y-3">
                {/* Transaction ref */}
                <InfoRow
                    icon={Hash}
                    label="Mã giao dịch"
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

                {/* Amount */}
                <InfoRow
                    icon={CreditCard}
                    label="Số tiền thanh toán"
                    value={formatCurrency(transaction.amount)}
                    valueClass="font-black text-emerald-600"
                />

                {/* Date */}
                <InfoRow
                    icon={Calendar}
                    label="Thời gian thanh toán"
                    value={formatDate(transaction.createdAt, true)}
                />

                {/* Secure badge */}
                <InfoRow
                    icon={ShieldCheck}
                    label="Bảo mật"
                    value="Giao dịch được mã hóa SSL 256-bit"
                    valueClass="text-emerald-600"
                />
            </div>

            {/* Price breakdown */}
            {order && (
                <div className="mt-5 pt-5 border-t border-base-200 space-y-2.5">
                    <PriceRow label="Tổng tiền hàng" value={formatCurrency(order.totalAmount)} />

                    {order.discountAmount > 0 && (
                        <PriceRow
                            label={`Giảm giá ${order.couponCode ? `(${order.couponCode})` : ''}`}
                            value={`-${formatCurrency(order.discountAmount)}`}
                            valueClass="text-emerald-600"
                        />
                    )}

                    <div className="pt-2.5 border-t border-base-200">
                        <PriceRow
                            label="Thành tiền"
                            value={formatCurrency(order.finalAmount)}
                            bold
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * InfoRow — Hàng thông tin key-value
 */
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

/**
 * PriceRow — Hàng giá tiền trong breakdown
 */
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
