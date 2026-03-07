import { CreditCard, Wallet, Building2, Smartphone } from 'lucide-react';

/**
 * Utility functions cho module Orders
 * Tập trung logic format, mapping để tái sử dụng
 */

// ─── Currency Formatting ────────────────────────────────────

/**
 * Format số tiền theo định dạng VND
 * @param {number} amount
 * @returns {string} Formatted string, e.g. "299.000₫"
 */
export function formatCurrency(amount) {
    if (amount === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

// ─── Date Formatting ────────────────────────────────────────

/**
 * Format ngày tháng
 * @param {string} dateString - ISO date string
 * @param {boolean} includeTime - Có hiển thị giờ không
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, includeTime = false) {
    const date = new Date(dateString);
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...(includeTime && { hour: '2-digit', minute: '2-digit' })
    };
    return date.toLocaleDateString('vi-VN', options);
}

/**
 * Format thời gian tương đối (e.g. "2 giờ trước")
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
export function formatRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;

    return formatDate(dateString);
}

// ─── Payment Method Mapping ─────────────────────────────────

const PAYMENT_METHODS = {
    momo: { label: 'Ví MoMo', icon: Wallet },
    vnpay: { label: 'VNPay', icon: CreditCard },
    zalopay: { label: 'ZaloPay', icon: Wallet },
    bank_transfer: { label: 'Chuyển khoản ngân hàng', icon: Building2 },
    visa: { label: 'Visa / Mastercard', icon: CreditCard },
    sepay: { label: 'SePay', icon: Smartphone }
};

/**
 * Lấy tên hiển thị của phương thức thanh toán
 * @param {string} method
 * @returns {string}
 */
export function getPaymentMethodLabel(method) {
    return PAYMENT_METHODS[method]?.label || method || 'Không xác định';
}

/**
 * Lấy icon component của phương thức thanh toán
 * @param {string} method
 * @returns {React.Component}
 */
export function getPaymentMethodIcon(method) {
    return PAYMENT_METHODS[method]?.icon || CreditCard;
}

// ─── Mock Data ──────────────────────────────────────────────

/**
 * Dữ liệu mock cho danh sách đơn hàng
 * Maps to: orders + order_items + transactions tables
 */
export const MOCK_ORDERS = [
    {
        id: 'ORD-SKR-2024001',
        status: 'completed',
        paymentMethod: 'momo',
        couponCode: 'SKR20',
        totalAmount: 299000,
        discountAmount: 59800,
        finalAmount: 239200,
        createdAt: '2026-02-10T14:30:00',
        completedAt: '2026-02-10T14:32:15',
        notes: '',
        items: [
            {
                id: 'OI-001',
                itemType: 'subscription',
                name: 'Gói Pro - 1 tháng',
                description: 'Truy cập toàn bộ khóa học, AI không giới hạn',
                quantity: 1,
                unitPrice: 299000,
                totalPrice: 299000,
                duration: '30 ngày'
            }
        ],
        transaction: {
            id: 'TXN-001',
            paymentMethod: 'momo',
            amount: 239200,
            status: 'completed',
            transactionRef: 'MOMO-TXN-987654321',
            createdAt: '2026-02-10T14:31:45'
        },
        timeline: [
            { type: 'created', title: 'Đơn hàng được tạo', time: '14:30', description: 'Bạn đã chọn Gói Pro - 1 tháng', isActive: true },
            { type: 'processing', title: 'Đang xử lý thanh toán', time: '14:31', description: 'Thanh toán qua MoMo', isActive: true },
            { type: 'completed', title: 'Thanh toán thành công', time: '14:32', description: 'Giao dịch hoàn tất. Gói Pro đã được kích hoạt.', isActive: true }
        ]
    },
    {
        id: 'ORD-SKR-2024002',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        couponCode: null,
        totalAmount: 699000,
        discountAmount: 0,
        finalAmount: 699000,
        createdAt: '2026-02-05T09:15:00',
        completedAt: '2026-02-05T09:45:00',
        notes: '',
        items: [
            {
                id: 'OI-002',
                itemType: 'subscription',
                name: 'Gói Premium - 1 tháng',
                description: 'Trải nghiệm cao cấp nhất, tư vấn 1-1 chuyên gia',
                quantity: 1,
                unitPrice: 699000,
                totalPrice: 699000,
                duration: '30 ngày'
            }
        ],
        transaction: {
            id: 'TXN-002',
            paymentMethod: 'bank_transfer',
            amount: 699000,
            status: 'completed',
            transactionRef: 'VCB-TXN-112233445',
            createdAt: '2026-02-05T09:42:00'
        },
        timeline: [
            { type: 'created', title: 'Đơn hàng được tạo', time: '09:15', description: 'Bạn đã chọn Gói Premium - 1 tháng', isActive: true },
            { type: 'pending', title: 'Chờ chuyển khoản', time: '09:16', description: 'Đã tạo mã thanh toán chuyển khoản ngân hàng', isActive: true },
            { type: 'processing', title: 'Đang xác nhận', time: '09:42', description: 'Ngân hàng xác nhận giao dịch', isActive: true },
            { type: 'completed', title: 'Hoàn thành', time: '09:45', description: 'Gói Premium đã được kích hoạt thành công', isActive: true }
        ]
    },
    {
        id: 'ORD-SKR-2024003',
        status: 'pending',
        paymentMethod: 'vnpay',
        couponCode: null,
        totalAmount: 149000,
        discountAmount: 0,
        finalAmount: 149000,
        createdAt: '2026-02-11T08:00:00',
        completedAt: null,
        notes: '',
        items: [
            {
                id: 'OI-003',
                itemType: 'subject',
                name: 'Toán Cao Cấp - Trọn bộ',
                description: 'Bao gồm tất cả chương, bài tập và flashcards',
                quantity: 1,
                unitPrice: 149000,
                totalPrice: 149000,
                duration: 'Vĩnh viễn'
            }
        ],
        transaction: null,
        timeline: [
            { type: 'created', title: 'Đơn hàng được tạo', time: '08:00', description: 'Bạn đã chọn Toán Cao Cấp - Trọn bộ', isActive: true },
            { type: 'pending', title: 'Chờ thanh toán', time: '08:00', description: 'Vui lòng hoàn tất thanh toán qua VNPay', isActive: true },
            { type: 'completed', title: 'Hoàn thành', time: '', description: '', isActive: false }
        ]
    },
    {
        id: 'ORD-SKR-2024004',
        status: 'cancelled',
        paymentMethod: 'zalopay',
        couponCode: 'SAVE50',
        totalAmount: 299000,
        discountAmount: 149500,
        finalAmount: 149500,
        createdAt: '2026-01-28T16:45:00',
        completedAt: null,
        notes: 'Hủy do hết thời gian thanh toán',
        items: [
            {
                id: 'OI-004',
                itemType: 'subscription',
                name: 'Gói Pro - 1 tháng',
                description: 'Truy cập toàn bộ khóa học, AI không giới hạn',
                quantity: 1,
                unitPrice: 299000,
                totalPrice: 299000,
                duration: '30 ngày'
            }
        ],
        transaction: null,
        timeline: [
            { type: 'created', title: 'Đơn hàng được tạo', time: '16:45', description: 'Bạn đã chọn Gói Pro với mã giảm giá SAVE50', isActive: true },
            { type: 'pending', title: 'Chờ thanh toán', time: '16:45', description: 'Đang chờ thanh toán qua ZaloPay', isActive: true },
            { type: 'cancelled', title: 'Đã hủy', time: '17:00', description: 'Hết thời gian thanh toán (15 phút)', isActive: true }
        ]
    },
    {
        id: 'ORD-SKR-2024005',
        status: 'refunded',
        paymentMethod: 'visa',
        couponCode: null,
        totalAmount: 699000,
        discountAmount: 0,
        finalAmount: 699000,
        createdAt: '2026-01-20T11:30:00',
        completedAt: '2026-01-20T11:32:00',
        notes: 'Hoàn tiền theo chính sách 7 ngày',
        items: [
            {
                id: 'OI-005',
                itemType: 'subscription',
                name: 'Gói Premium - 1 tháng',
                description: 'Trải nghiệm cao cấp nhất',
                quantity: 1,
                unitPrice: 699000,
                totalPrice: 699000,
                duration: '30 ngày'
            }
        ],
        transaction: {
            id: 'TXN-003',
            paymentMethod: 'visa',
            amount: 699000,
            status: 'refunded',
            transactionRef: 'VISA-TXN-556677889',
            createdAt: '2026-01-20T11:31:30'
        },
        timeline: [
            { type: 'created', title: 'Đơn hàng được tạo', time: '11:30', description: 'Gói Premium - 1 tháng', isActive: true },
            { type: 'completed', title: 'Thanh toán thành công', time: '11:32', description: 'Thanh toán qua Visa', isActive: true },
            { type: 'refunded', title: 'Đã hoàn tiền', time: '25/01', description: 'Hoàn 699.000₫ về thẻ Visa. Chính sách hoàn tiền 7 ngày.', isActive: true }
        ]
    },
    {
        id: 'ORD-SKR-2024006',
        status: 'completed',
        paymentMethod: 'momo',
        couponCode: 'WELCOME10',
        totalAmount: 298000,
        discountAmount: 29800,
        finalAmount: 268200,
        createdAt: '2026-01-15T20:10:00',
        completedAt: '2026-01-15T20:12:00',
        notes: '',
        items: [
            {
                id: 'OI-006',
                itemType: 'subject',
                name: 'Tiếng Anh Chuyên Ngành IT',
                description: 'Bao gồm 120 flashcards và 15 bài thi',
                quantity: 1,
                unitPrice: 149000,
                totalPrice: 149000,
                duration: 'Vĩnh viễn'
            },
            {
                id: 'OI-007',
                itemType: 'subject',
                name: 'Lập Trình Python Cơ Bản',
                description: 'Bao gồm 89 flashcards và 12 bài thi',
                quantity: 1,
                unitPrice: 149000,
                totalPrice: 149000,
                duration: 'Vĩnh viễn'
            }
        ],
        transaction: {
            id: 'TXN-004',
            paymentMethod: 'momo',
            amount: 268200,
            status: 'completed',
            transactionRef: 'MOMO-TXN-334455667',
            createdAt: '2026-01-15T20:11:30'
        },
        timeline: [
            { type: 'created', title: 'Đơn hàng được tạo', time: '20:10', description: '2 môn học với mã giảm giá WELCOME10', isActive: true },
            { type: 'processing', title: 'Đang xử lý', time: '20:11', description: 'Thanh toán qua MoMo', isActive: true },
            { type: 'completed', title: 'Hoàn thành', time: '20:12', description: 'Đã mở khóa 2 môn học thành công', isActive: true }
        ]
    }
];
