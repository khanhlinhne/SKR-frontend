// ─── Tests Module: Mock Data & Utilities ────────────────
// Maps to: lrn_practice_tests, lrn_quiz_attempts, lrn_quiz_answers,
//          cnt_questions, cnt_question_options

// ─── Difficulty Config ──────────────────────────────────
export const DIFFICULTY_CONFIG = {
    easy: { label: 'Dễ', color: 'text-green-600', bg: 'bg-green-500/10', badge: 'badge-success' },
    medium: { label: 'Trung bình', color: 'text-yellow-600', bg: 'bg-yellow-500/10', badge: 'badge-warning' },
    hard: { label: 'Khó', color: 'text-orange-600', bg: 'bg-orange-500/10', badge: 'badge-error' },
    expert: { label: 'Chuyên gia', color: 'text-red-600', bg: 'bg-red-500/10', badge: 'badge-error' },
};

// ─── Question Type Config ───────────────────────────────
export const QUESTION_TYPE_CONFIG = {
    multiple_choice: { label: 'Trắc nghiệm', icon: 'ListChecks', color: 'text-blue-500' },
    true_false: { label: 'Đúng/Sai', icon: 'ToggleLeft', color: 'text-green-500' },
    fill_in_blank: { label: 'Điền khuyết', icon: 'TextCursorInput', color: 'text-purple-500' },
    short_answer: { label: 'Trả lời ngắn', icon: 'MessageSquare', color: 'text-orange-500' },
};

// ─── Test Status Config ─────────────────────────────────
export const TEST_STATUS_CONFIG = {
    active: { label: 'Hoạt động', badge: 'badge-success', icon: 'CheckCircle2' },
    draft: { label: 'Nháp', badge: 'badge-ghost', icon: 'FileEdit' },
    archived: { label: 'Lưu trữ', badge: 'badge-warning', icon: 'Archive' },
};

// ─── Subject Config ─────────────────────────────────────
export const SUBJECT_CONFIG = {
    math: { label: 'Toán học', icon: '📐', gradient: 'from-blue-500 to-cyan-500' },
    english: { label: 'Tiếng Anh', icon: '🇬🇧', gradient: 'from-green-500 to-emerald-500' },
    programming: { label: 'Lập trình', icon: '💻', gradient: 'from-purple-500 to-violet-500' },
    science: { label: 'Khoa học', icon: '🔬', gradient: 'from-orange-500 to-red-500' },
    economics: { label: 'Kinh tế', icon: '📊', gradient: 'from-yellow-500 to-amber-500' },
    database: { label: 'Cơ sở dữ liệu', icon: '💾', gradient: 'from-indigo-500 to-blue-500' },
};

// ─── Mock Practice Tests ────────────────────────────────
export const MOCK_PRACTICE_TESTS = [
    {
        id: 'pt-001',
        title: 'Toán Cao Cấp - Giải Tích',
        description: 'Tổng hợp đạo hàm, tích phân và chuỗi số',
        subjectKey: 'math',
        difficulty: 'medium',
        totalQuestions: 30,
        timeLimitMinutes: 45,
        attemptsCount: 5,
        bestScore: 87.5,
        averageScore: 76.2,
        lastAttemptAt: '2026-02-18T10:30:00Z',
        questionTypes: ['multiple_choice', 'fill_in_blank'],
        randomizeQuestions: true,
        randomizeOptions: true,
        showCorrectAnswers: true,
        createdAt: '2026-01-15T08:00:00Z',
        status: 'active',
    },
    {
        id: 'pt-002',
        title: 'IELTS Reading Practice',
        description: 'Luyện đọc hiểu IELTS Academic với các passage khó',
        subjectKey: 'english',
        difficulty: 'hard',
        totalQuestions: 40,
        timeLimitMinutes: 60,
        attemptsCount: 3,
        bestScore: 72.5,
        averageScore: 65.8,
        lastAttemptAt: '2026-02-17T14:00:00Z',
        questionTypes: ['multiple_choice', 'true_false', 'fill_in_blank'],
        randomizeQuestions: false,
        randomizeOptions: false,
        showCorrectAnswers: true,
        createdAt: '2026-01-20T09:00:00Z',
        status: 'active',
    },
    {
        id: 'pt-003',
        title: 'Python OOP & Design Patterns',
        description: 'Kiểm tra kiến thức về lập trình hướng đối tượng và các mẫu thiết kế',
        subjectKey: 'programming',
        difficulty: 'hard',
        totalQuestions: 25,
        timeLimitMinutes: 40,
        attemptsCount: 2,
        bestScore: 92.0,
        averageScore: 88.0,
        lastAttemptAt: '2026-02-16T09:00:00Z',
        questionTypes: ['multiple_choice', 'short_answer'],
        randomizeQuestions: true,
        randomizeOptions: true,
        showCorrectAnswers: true,
        createdAt: '2026-02-01T10:00:00Z',
        status: 'active',
    },
    {
        id: 'pt-004',
        title: 'SQL Fundamentals',
        description: 'Kiểm tra câu lệnh SQL cơ bản đến nâng cao',
        subjectKey: 'database',
        difficulty: 'easy',
        totalQuestions: 20,
        timeLimitMinutes: 30,
        attemptsCount: 8,
        bestScore: 100,
        averageScore: 95.5,
        lastAttemptAt: '2026-02-15T16:00:00Z',
        questionTypes: ['multiple_choice', 'fill_in_blank'],
        randomizeQuestions: true,
        randomizeOptions: true,
        showCorrectAnswers: true,
        createdAt: '2026-01-10T08:00:00Z',
        status: 'active',
    },
    {
        id: 'pt-005',
        title: 'Vật Lý Đại Cương - Cơ Nhiệt',
        description: 'Bài kiểm tra tổng hợp các định luật Newton, nhiệt động lực học',
        subjectKey: 'science',
        difficulty: 'medium',
        totalQuestions: 35,
        timeLimitMinutes: 50,
        attemptsCount: 0,
        bestScore: null,
        averageScore: null,
        lastAttemptAt: null,
        questionTypes: ['multiple_choice', 'true_false'],
        randomizeQuestions: true,
        randomizeOptions: true,
        showCorrectAnswers: true,
        createdAt: '2026-02-10T11:00:00Z',
        status: 'active',
    },
    {
        id: 'pt-006',
        title: 'Kinh Tế Vĩ Mô - Mô Hình IS-LM',
        description: 'Phân tích và vận dụng mô hình IS-LM, chính sách tiền tệ',
        subjectKey: 'economics',
        difficulty: 'expert',
        totalQuestions: 15,
        timeLimitMinutes: 25,
        attemptsCount: 1,
        bestScore: 60.0,
        averageScore: 60.0,
        lastAttemptAt: '2026-02-12T08:00:00Z',
        questionTypes: ['multiple_choice', 'short_answer'],
        randomizeQuestions: false,
        randomizeOptions: false,
        showCorrectAnswers: true,
        createdAt: '2026-02-05T07:00:00Z',
        status: 'draft',
    },
];

// ─── Mock Questions (for quiz-taking) ───────────────────
export const MOCK_QUESTIONS = [
    {
        id: 'q-001',
        type: 'multiple_choice',
        text: 'Đạo hàm của hàm số f(x) = 3x² + 2x - 5 là?',
        explanation: 'Áp dụng công thức đạo hàm: (axⁿ)\' = n·a·xⁿ⁻¹',
        difficulty: 'easy',
        points: 1,
        timeLimitSeconds: 60,
        imageUrl: null,
        options: [
            { id: 'o-001a', text: 'f\'(x) = 6x + 2', isCorrect: true },
            { id: 'o-001b', text: 'f\'(x) = 3x + 2', isCorrect: false },
            { id: 'o-001c', text: 'f\'(x) = 6x² + 2', isCorrect: false },
            { id: 'o-001d', text: 'f\'(x) = 6x - 5', isCorrect: false },
        ],
    },
    {
        id: 'q-002',
        type: 'multiple_choice',
        text: 'Tích phân ∫(2x + 1)dx bằng bao nhiêu?',
        explanation: '∫(2x + 1)dx = x² + x + C, với C là hằng số tích phân.',
        difficulty: 'easy',
        points: 1,
        timeLimitSeconds: 60,
        imageUrl: null,
        options: [
            { id: 'o-002a', text: 'x² + x + C', isCorrect: true },
            { id: 'o-002b', text: '2x² + x + C', isCorrect: false },
            { id: 'o-002c', text: 'x² + C', isCorrect: false },
            { id: 'o-002d', text: '2x + C', isCorrect: false },
        ],
    },
    {
        id: 'q-003',
        type: 'true_false',
        text: 'Hàm số f(x) = |x| liên tục tại x = 0.',
        explanation: 'Đúng. Hàm trị tuyệt đối liên tục tại mọi điểm trên ℝ, bao gồm x = 0, mặc dù không khả vi tại đó.',
        difficulty: 'medium',
        points: 1,
        timeLimitSeconds: 45,
        imageUrl: null,
        options: [
            { id: 'o-003a', text: 'Đúng', isCorrect: true },
            { id: 'o-003b', text: 'Sai', isCorrect: false },
        ],
    },
    {
        id: 'q-004',
        type: 'multiple_choice',
        text: 'Giới hạn lim(x→0) sin(x)/x bằng?',
        explanation: 'Đây là giới hạn cơ bản nổi tiếng: lim(x→0) sin(x)/x = 1. Có thể chứng minh bằng quy tắc L\'Hôpital hoặc hình học.',
        difficulty: 'medium',
        points: 1.5,
        timeLimitSeconds: 60,
        imageUrl: null,
        options: [
            { id: 'o-004a', text: '0', isCorrect: false },
            { id: 'o-004b', text: '1', isCorrect: true },
            { id: 'o-004c', text: '∞', isCorrect: false },
            { id: 'o-004d', text: 'Không tồn tại', isCorrect: false },
        ],
    },
    {
        id: 'q-005',
        type: 'multiple_choice',
        text: 'Ma trận A có det(A) = 0. Điều nào sau đây đúng?',
        explanation: 'Khi det(A) = 0, ma trận A suy biến (singular) nên không tồn tại ma trận nghịch đảo.',
        difficulty: 'medium',
        points: 1.5,
        timeLimitSeconds: 90,
        imageUrl: null,
        options: [
            { id: 'o-005a', text: 'A có nghịch đảo', isCorrect: false },
            { id: 'o-005b', text: 'A là ma trận đơn vị', isCorrect: false },
            { id: 'o-005c', text: 'A không khả nghịch', isCorrect: true },
            { id: 'o-005d', text: 'Hệ phương trình Ax=b luôn có nghiệm duy nhất', isCorrect: false },
        ],
    },
    {
        id: 'q-006',
        type: 'fill_in_blank',
        text: 'Đạo hàm của hàm số f(x) = eˣ là f\'(x) = ___',
        explanation: 'Hàm mũ cơ số e có tính chất đặc biệt: đạo hàm bằng chính nó → (eˣ)\' = eˣ.',
        difficulty: 'easy',
        points: 1,
        timeLimitSeconds: 30,
        imageUrl: null,
        correctAnswer: 'eˣ',
        acceptedAnswers: ['eˣ', 'e^x', 'ex', 'exp(x)'],
        options: [],
    },
    {
        id: 'q-007',
        type: 'multiple_choice',
        text: 'Chuỗi Σ(n=1→∞) 1/n có tính chất gì?',
        explanation: 'Chuỗi Σ 1/n (chuỗi điều hòa) là chuỗi phân kỳ nổi tiếng. Có thể chứng minh bằng tiêu chuẩn tích phân Cauchy.',
        difficulty: 'hard',
        points: 2,
        timeLimitSeconds: 90,
        imageUrl: null,
        options: [
            { id: 'o-007a', text: 'Hội tụ về 0', isCorrect: false },
            { id: 'o-007b', text: 'Hội tụ về 1', isCorrect: false },
            { id: 'o-007c', text: 'Phân kỳ', isCorrect: true },
            { id: 'o-007d', text: 'Hội tụ có điều kiện', isCorrect: false },
        ],
    },
    {
        id: 'q-008',
        type: 'true_false',
        text: 'Mọi hàm số liên tục trên [a,b] đều khả vi trên (a,b).',
        explanation: 'Sai. Ví dụ hàm f(x) = |x| liên tục trên [-1,1] nhưng không khả vi tại x = 0.',
        difficulty: 'medium',
        points: 1,
        timeLimitSeconds: 45,
        imageUrl: null,
        options: [
            { id: 'o-008a', text: 'Đúng', isCorrect: false },
            { id: 'o-008b', text: 'Sai', isCorrect: true },
        ],
    },
    {
        id: 'q-009',
        type: 'multiple_choice',
        text: 'Cho hàm f(x) = x³ - 3x. Điểm cực đại của hàm số là?',
        explanation: 'f\'(x) = 3x² - 3 = 0 → x = ±1. f\'\'(x) = 6x. Tại x = -1: f\'\'(-1) = -6 < 0 → cực đại. f(-1) = 2.',
        difficulty: 'hard',
        points: 2,
        timeLimitSeconds: 120,
        imageUrl: null,
        options: [
            { id: 'o-009a', text: 'x = 1, f(1) = -2', isCorrect: false },
            { id: 'o-009b', text: 'x = -1, f(-1) = 2', isCorrect: true },
            { id: 'o-009c', text: 'x = 0, f(0) = 0', isCorrect: false },
            { id: 'o-009d', text: 'x = 3, f(3) = 18', isCorrect: false },
        ],
    },
    {
        id: 'q-010',
        type: 'multiple_choice',
        text: 'Phương trình đặc trưng của ma trận A = [[2,1],[1,2]] là?',
        explanation: 'det(A - λI) = (2-λ)² - 1 = λ² - 4λ + 3 = 0. Nghiệm: λ₁ = 1, λ₂ = 3.',
        difficulty: 'hard',
        points: 2,
        timeLimitSeconds: 120,
        imageUrl: null,
        options: [
            { id: 'o-010a', text: 'λ² - 4λ + 3 = 0', isCorrect: true },
            { id: 'o-010b', text: 'λ² - 4λ + 4 = 0', isCorrect: false },
            { id: 'o-010c', text: 'λ² + 4λ + 3 = 0', isCorrect: false },
            { id: 'o-010d', text: 'λ² - 2λ + 1 = 0', isCorrect: false },
        ],
    },
];

// ─── Utility Functions ──────────────────────────────────

/** Format thời gian từ giây */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** Format thời gian từ phút */
export function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} phút`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}p` : `${hrs} giờ`;
}

/** Format relative time */
export function formatRelativeTime(dateString) {
    if (!dateString) return 'Chưa thi';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

/** Format score with color */
export function getScoreColor(score) {
    if (score === null || score === undefined) return 'text-base-content/40';
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
}

/** Get score grade label */
export function getScoreGrade(score) {
    if (score === null || score === undefined) return { label: '—', color: 'text-base-content/40' };
    if (score >= 90) return { label: 'Xuất sắc', color: 'text-green-500' };
    if (score >= 80) return { label: 'Giỏi', color: 'text-blue-500' };
    if (score >= 70) return { label: 'Khá', color: 'text-cyan-500' };
    if (score >= 50) return { label: 'Trung bình', color: 'text-yellow-500' };
    return { label: 'Yếu', color: 'text-red-500' };
}
