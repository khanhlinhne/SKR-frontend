import {
    ArrowUpRight,
    BarChart3,
    BookOpenText,
    BrainCircuit,
    CheckCircle2,
    Clock3,
    GraduationCap,
    Layers3,
    ShieldCheck,
    Sparkles,
    WandSparkles,
} from 'lucide-react';

export const heroMetrics = [
    { value: '12.400+', label: 'người học đang hoạt động mỗi ngày' },
    { value: '92%', label: 'tỷ lệ giữ nhịp ôn tập sau 30 ngày' },
    { value: '< 2 phút', label: 'để tạo một bộ học liệu mới' },
];

export const heroHighlights = [
    {
        title: 'Luồng học tập luôn tập trung',
        description: 'Bài học, flashcard và bài kiểm tra được gom vào một không gian rõ ràng, ít nhiễu.',
        icon: Layers3,
    },
    {
        title: 'AI hỗ trợ đúng lúc',
        description: 'Không chatbot dư thừa. Chỉ có gợi ý, giải thích và tóm tắt khi người học thật sự cần.',
        icon: BrainCircuit,
    },
    {
        title: 'Tiến độ có thể hành động',
        description: 'Báo cáo ngắn, dễ đọc, đủ để biết hôm nay nên học gì tiếp theo.',
        icon: BarChart3,
    },
];

export const featureCards = [
    {
        eyebrow: 'Không gian học',
        title: 'Một nơi cho toàn bộ nhịp học của bạn.',
        description: 'Môn học, bài học, tài liệu và flashcards nằm song song trong một bố cục gọn, không bị ngắt mạch khi chuyển ngữ cảnh.',
        icon: BookOpenText,
        tone: 'slate',
        size: 'large',
        bullets: ['Tài liệu, video và quiz trong cùng một view', 'Ưu tiên nội dung thay vì hiệu ứng trang trí'],
    },
    {
        eyebrow: 'AI',
        title: 'Tạo, tinh chỉnh và giải thích.',
        description: 'Sinh câu hỏi, tóm tắt và giải thích theo ngữ cảnh thay vì phản hồi chung chung.',
        icon: WandSparkles,
        tone: 'blue',
        size: 'small',
        bullets: ['Sinh bộ câu hỏi từ tài liệu', 'Giải thích ngắn, đúng trọng tâm'],
    },
    {
        eyebrow: 'Ôn tập',
        title: 'Spaced repetition bớt ồn hơn.',
        description: 'Lịch ôn tập biết ưu tiên. Thẻ dễ nhìn. Hành động tiếp theo luôn rõ ràng.',
        icon: Clock3,
        tone: 'zinc',
        size: 'small',
        bullets: ['Nhắc ôn theo mức độ ghi nhớ', 'Không có badge hay popup dư thừa'],
    },
    {
        eyebrow: 'Tin cậy',
        title: 'Xây cho người học, người dạy và tổ chức.',
        description: 'Người học cần đơn giản. Người dạy cần kiểm soát. Tổ chức cần bảo mật. Giao diện phục vụ cả ba.',
        icon: ShieldCheck,
        tone: 'green',
        size: 'wide',
        bullets: ['Phân quyền rõ ràng', 'Nội dung có thể mở rộng theo chương trình'],
    },
];

export const featuredCourses = [
    {
        title: 'Toán cao cấp',
        subtitle: 'Giải tích và đại số được chia theo từng bước học, đi kèm flashcards và mini test.',
        instructor: 'TS. Nguyễn Văn Minh',
        stats: ['48 bài học', '200 câu hỏi', '32 giờ'],
        price: '299.000đ',
        accent: 'blue',
        image: '/images/courses/math-banner.png',
    },
    {
        title: 'IELTS Academic 7.0+',
        subtitle: 'Lộ trình ôn tập cho Reading, Writing và Speaking trong một dashboard thống nhất.',
        instructor: 'ThS. Trần Thu Hà',
        stats: ['64 bài học', '500 câu hỏi', '45 giờ'],
        price: '599.000đ',
        accent: 'slate',
        image: '/images/courses/ielts-banner.png',
    },
    {
        title: 'Python cho AI',
        subtitle: 'Thực hành, flashcards và mini tests để giữ nhịp học đều mỗi tuần.',
        instructor: 'TS. Đoàn Thế Anh',
        stats: ['56 bài học', '300 câu hỏi', '40 giờ'],
        price: '399.000đ',
        accent: 'indigo',
        image: '/images/courses/python-ai-banner.png',
    },
];

export const trustNotes = [
    {
        title: 'Giảng viên đang dùng thật',
        description: 'Course blocks, tracking và feedback được trình bày rõ ràng để dạy học thuận tay hơn.',
        icon: GraduationCap,
    },
    {
        title: 'Người học quay lại hằng ngày',
        description: 'Nhịp ôn tập được thiết kế để duy trì động lực mà không làm người học bị quá tải.',
        icon: Sparkles,
    },
    {
        title: 'Trải nghiệm mượt mà',
        description: 'Tương tác nhanh, rõ và ít ma sát để người học giữ được sự tập trung lâu hơn.',
        icon: ArrowUpRight,
    },
];

export const pricingPlans = [
    {
        name: 'Miễn phí',
        description: 'Dành cho người muốn bắt đầu với flashcards, quiz và dashboard cơ bản.',
        monthlyPrice: 0,
        yearlyPrice: 0,
        caption: 'Không giới hạn thời gian sử dụng',
        cta: 'Bắt đầu miễn phí',
        emphasis: false,
        features: [
            'Bộ flashcard cơ bản',
            '3 bộ tự tạo',
            'Quiz hằng ngày',
            'Dashboard 7 ngày',
        ],
    },
    {
        name: 'Premium',
        description: 'Dành cho người học cần AI, lời giải chi tiết, lịch ôn tập và thống kê sâu hơn.',
        monthlyPrice: 99000,
        yearlyPrice: 79000,
        caption: 'Thanh toán theo tháng hoặc theo năm',
        cta: 'Nâng cấp Premium',
        emphasis: true,
        features: [
            'Flashcards không giới hạn',
            'AI tạo câu hỏi và giải thích',
            'Spaced repetition thông minh',
            'Thống kê tiến độ chi tiết',
            'Hỗ trợ ưu tiên',
        ],
    },
];

export const footerColumns = [
    {
        title: 'Sản phẩm',
        links: [
            { label: 'Tính năng', href: '#features' },
            { label: 'Môn học', href: '#curriculum' },
            { label: 'Bảng giá', href: '#pricing' },
        ],
    },
    {
        title: 'Tài nguyên',
        links: [
            { label: 'Đăng nhập', href: '/login' },
            { label: 'Đăng ký', href: '/signup' },
            { label: 'Dashboard', href: '/dashboard' },
        ],
    },
    {
        title: 'Liên hệ',
        links: [
            { label: 'contact@skr.edu.vn', href: 'mailto:contact@skr.edu.vn' },
            { label: '+84 123 456 789', href: 'tel:+84123456789' },
        ],
    },
];

export const includedFeatureIcon = CheckCircle2;
