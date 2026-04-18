import { motion } from 'motion/react';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock3,
    Mail,
    RotateCw,
    XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const toneConfig = {
    success: {
        chip: 'Đã xác nhận thanh toán',
        title: 'Thanh toán thành công',
        icon: CheckCircle2,
        gradient: 'from-emerald-500 to-teal-500',
        iconShadow: 'shadow-emerald-500/20',
        amountTone: 'text-emerald-600',
    },
    failure: {
        chip: 'Chưa ghi nhận thanh toán',
        title: 'Chưa thể cấp quyền học',
        icon: XCircle,
        gradient: 'from-rose-500 to-orange-500',
        iconShadow: 'shadow-rose-500/20',
        amountTone: 'text-rose-600',
    },
    pending: {
        chip: 'Đang chờ PayOS phản hồi',
        title: 'Hệ thống đang kiểm tra giao dịch',
        icon: Clock3,
        gradient: 'from-amber-400 to-orange-500',
        iconShadow: 'shadow-amber-500/20',
        amountTone: 'text-amber-600',
    },
};

export default function CheckoutSuccess({
    status = 'success',
    title,
    description,
    transaction,
    plan,
    orderType = 'course',
    destinationPath = '/dashboard',
    destinationLabel = 'Vào học ngay',
    secondaryPath = '/dashboard',
    secondaryLabel = 'Về dashboard',
    onRetry,
    retryLabel = 'Kiểm tra lại',
}) {
    const tone = toneConfig[status] || toneConfig.success;
    const StatusIcon = tone.icon;
    const isCourseOrder = orderType === 'course';

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl"
        >
            <div className="apple-panel apple-card-shadow rounded-[36px] border p-8 text-center sm:p-10">
                <div className={`inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r ${tone.gradient} shadow-xl ${tone.iconShadow}`}>
                    <StatusIcon className="h-12 w-12 text-white" />
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-base-content/60">
                    {tone.chip}
                </div>

                <h2 className="apple-main-text mt-5 text-4xl font-semibold tracking-[-0.04em]">
                    {title || tone.title}
                </h2>
                <p className="apple-secondary-text mt-4 text-base leading-7">
                    {description || (
                        isCourseOrder
                            ? `Quyền truy cập vào ${plan?.name || 'khóa học'} sẽ được cập nhật ngay khi backend xác nhận giao dịch.`
                            : 'Trạng thái thanh toán của bạn đã được cập nhật.' 
                    )}
                </p>

                <div className="mt-8 rounded-[28px] border border-white/45 bg-white/75 p-5 text-left shadow-sm backdrop-blur-xl">
                    <h3 className="text-sm font-semibold text-base-content">Thông tin giao dịch</h3>
                    <div className="mt-4 space-y-3 text-sm">
                        <DetailRow label="Mã đơn" value={transaction?.orderCode || transaction?.id || 'Chưa có'} />
                        <DetailRow label={isCourseOrder ? 'Khóa học' : 'Gói'} value={plan?.name || 'SKR'} />
                        <DetailRow label="Phương thức" value={transaction?.paymentMethod || 'Chuyển khoản PayOS'} />
                        <DetailRow label="Số tiền" value={transaction?.amount || '0đ'} highlightTone={tone.amountTone} />
                        <DetailRow label="Trạng thái" value={transaction?.message || description || tone.title} />
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-sm text-base-content/50">
                    <Mail className="h-4 w-4" />
                    Thông báo thanh toán sẽ luôn đồng bộ theo kết quả verify từ backend
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    {status === 'success' ? (
                        <Link
                            to={destinationPath}
                            className="apple-primary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
                        >
                            <BookOpen className="mr-2 h-4 w-4" />
                            {destinationLabel}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    ) : onRetry ? (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="apple-primary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
                        >
                            <RotateCw className="mr-2 h-4 w-4" />
                            {retryLabel}
                        </button>
                    ) : null}

                    <Link
                        to={secondaryPath}
                        className="apple-secondary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
                    >
                        {secondaryLabel}
                    </Link>
                </div>
            </div>
        </motion.section>
    );
}

function DetailRow({ label, value, highlightTone = 'text-base-content' }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-base-content/55">{label}</span>
            <span className={`text-right font-semibold ${highlightTone}`}>{value}</span>
        </div>
    );
}
