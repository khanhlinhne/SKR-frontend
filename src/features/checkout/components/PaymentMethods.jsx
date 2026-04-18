import { motion } from 'motion/react';
import {
    ArrowRight,
    CheckCircle2,
    Copy,
    Landmark,
    QrCode,
    Shield,
    WalletCards,
} from 'lucide-react';

export default function PaymentMethods({
    paymentSession,
    onOpenCheckout,
    onConfirmPaid,
    isChecking = false,
}) {
    const transferRows = [
        { label: 'Ngân hàng', value: paymentSession?.bankId || 'PayOS' },
        { label: 'Số tài khoản', value: paymentSession?.accountNo || 'Đang cập nhật' },
        { label: 'Chủ tài khoản', value: paymentSession?.accountName || 'Đang cập nhật' },
        { label: 'Nội dung CK', value: paymentSession?.addInfo || paymentSession?.orderCode || 'Đang cập nhật' },
    ];

    return (
        <section className="apple-panel apple-card-shadow rounded-[32px] border p-6 sm:p-7">
            <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                PayOS transfer
            </div>
            <h2 className="apple-main-text mt-5 text-3xl font-semibold tracking-[-0.03em]">
                Thanh toán bằng chuyển khoản qua PayOS
            </h2>
            <p className="apple-secondary-text mt-3 text-sm leading-7">
                Backend hiện chỉ hỗ trợ một phương thức thanh toán cho mua khóa học. Bạn có thể mở trang PayOS
                hoặc quét mã QR bên dưới, sau đó bấm xác nhận để hệ thống kiểm tra giao dịch.
            </p>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.94fr_1.06fr]">
                <div className="rounded-[28px] border border-white/45 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
                        <QrCode className="h-4 w-4 text-sky-600" />
                        Mã QR thanh toán
                    </div>

                    {paymentSession?.qrUrl ? (
                        <div className="mt-4 overflow-hidden rounded-[24px] border border-base-200 bg-white p-4">
                            <img
                                src={paymentSession.qrUrl}
                                alt={`QR thanh toán ${paymentSession.orderCode || ''}`.trim()}
                                className="mx-auto aspect-square w-full max-w-[320px] object-contain"
                            />
                        </div>
                    ) : (
                        <div className="mt-4 rounded-[24px] border border-dashed border-base-300 bg-base-100 px-4 py-8 text-center text-sm text-base-content/55">
                            Backend chưa trả về QR cho đơn này.
                        </div>
                    )}

                    <p className="mt-4 text-xs leading-6 text-base-content/55">
                        Mã QR và link checkout đều trỏ về cùng giao dịch PayOS. Hãy dùng đúng nội dung chuyển
                        khoản để backend đối soát tự động.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="rounded-[28px] border border-white/45 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                        <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
                            <WalletCards className="h-4 w-4 text-emerald-600" />
                            Thông tin chuyển khoản
                        </div>

                        <div className="mt-4 space-y-3">
                            {transferRows.map((row, index) => (
                                <motion.div
                                    key={row.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    className="rounded-[22px] border border-base-200 bg-base-100/80 px-4 py-3"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/45">
                                        {row.label}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <p className="min-w-0 flex-1 break-all text-sm font-semibold text-base-content">
                                            {row.value}
                                        </p>
                                        <CopyValueButton value={row.value} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-base-200 bg-base-100/75 p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
                            <Landmark className="h-4 w-4 text-orange-600" />
                            Mã đơn cần kiểm tra
                        </div>
                        <p className="mt-3 text-lg font-semibold text-base-content">
                            {paymentSession?.orderCode || 'Chưa có orderCode'}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-base-content/60">
                            Sau khi hoàn tất chuyển khoản, bấm nút xác nhận đã thanh toán để frontend gọi
                            `GET /api/orders/:orderCode/verify`.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-emerald-500/15 bg-emerald-500/7 px-4 py-4">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                <p className="text-sm leading-7 text-emerald-800">
                    Thông tin thanh toán chỉ dùng để đối soát giao dịch. Quyền học sẽ được cấp đúng cho tài
                    khoản hiện tại sau khi backend xác nhận PayOS đã thanh toán.
                </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={onOpenCheckout}
                    disabled={!paymentSession?.checkoutUrl}
                    className="apple-primary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-50"
                >
                    Mở trang thanh toán PayOS
                    <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                {onConfirmPaid ? (
                    <button
                        type="button"
                        onClick={onConfirmPaid}
                        disabled={!paymentSession?.orderCode || isChecking}
                        className="apple-secondary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-50"
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {isChecking ? 'Đang kiểm tra thanh toán...' : 'Tôi đã thanh toán'}
                    </button>
                ) : null}
            </div>
        </section>
    );
}

function CopyValueButton({ value }) {
    const canCopy = Boolean(value) && value !== 'Đang cập nhật';

    const handleCopy = async () => {
        if (!canCopy || !navigator?.clipboard) {
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // Ignore clipboard failures and keep checkout flow uninterrupted.
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            disabled={!canCopy}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-base-200 bg-base-100 text-base-content/60 transition hover:text-base-content disabled:opacity-40"
            aria-label={`Sao chép ${value || 'giá trị'}`}
        >
            <Copy className="h-4 w-4" />
        </button>
    );
}
