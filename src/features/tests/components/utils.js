// ─── Tests Module: Configs & Utilities ───────────────────
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

// ─── Default Gradient (khi không có subject riêng) ──────
export const DEFAULT_GRADIENT = 'from-blue-500 to-violet-500';
export const DEFAULT_ICON = '📝';



// ─── Utility Functions ──────────────────────────────────

/** Format thời gian từ giây */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** Format thời gian từ phút */
export function formatDuration(minutes) {
    if (minutes == null || minutes === 0) return 'Không giới hạn';
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
