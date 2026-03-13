import { motion } from 'motion/react';
import { ArrowRight, BookOpen, CheckCircle2, Mail, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CheckoutSuccess({
    transaction,
    plan,
    orderType = 'subscription',
    destinationPath = '/dashboard',
    destinationLabel = 'Bắt đầu học ngay',
    secondaryPath = '/dashboard',
    secondaryLabel = 'Về dashboard',
}) {
    const isCourseOrder = orderType === 'course';

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl"
        >
            <div className="apple-panel apple-card-shadow rounded-[36px] border p-8 text-center sm:p-10">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-amber-600">
                    <PartyPopper className="h-5 w-5" />
                    <span className="text-sm font-semibold uppercase tracking-[0.16em]">Thanh toán thành công</span>
                </div>

                <h2 className="apple-main-text mt-5 text-4xl font-semibold tracking-[-0.04em]">
                    {isCourseOrder ? 'Bạn đã sở hữu khóa học này' : 'Gói học tập đã được kích hoạt'}
                </h2>
                <p className="apple-secondary-text mt-4 text-base leading-7">
                    {isCourseOrder
                        ? `Quyền truy cập vào ${plan?.name} đã sẵn sàng trên tài khoản của bạn.`
                        : `Gói ${plan?.name} đã được kích hoạt và có thể dùng ngay trong dashboard.`}
                </p>

                <div className="mt-8 rounded-[28px] border border-white/45 bg-white/75 p-5 text-left shadow-sm backdrop-blur-xl">
                    <h3 className="text-sm font-semibold text-base-content">Thông tin giao dịch</h3>
                    <div className="mt-4 space-y-3 text-sm">
                        <DetailRow label="Mã giao dịch" value={transaction?.id || 'TXN-SKR-20260313-001'} />
                        <DetailRow label={isCourseOrder ? 'Khóa học' : 'Gói'} value={plan?.name || 'SKR'} />
                        <DetailRow label="Phương thức" value={transaction?.paymentMethod || 'Ví MoMo'} />
                        <DetailRow label="Số tiền" value={transaction?.amount || '0đ'} highlight />
                        <DetailRow label="Thời gian" value={new Date().toLocaleString('vi-VN')} />
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-sm text-base-content/50">
                    <Mail className="h-4 w-4" />
                    Biên lai đã được gửi đến email của bạn
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                        to={destinationPath}
                        className="apple-primary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
                    >
                        <BookOpen className="mr-2 h-4 w-4" />
                        {destinationLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
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

function DetailRow({ label, value, highlight = false }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-base-content/55">{label}</span>
            <span className={`text-right font-semibold ${highlight ? 'text-emerald-600' : 'text-base-content'}`}>{value}</span>
        </div>
    );
}
