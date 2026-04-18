import {
    PlayCircle,
    FileText,
    HelpCircle,
    Sparkles,
    ClipboardCheck,
} from 'lucide-react';
import { resolveFlashcardImageUrl } from '@/features/flashcards/utils/imageUrl';

export const lessonTypeConfig = {
    video: {
        label: 'Video',
        icon: PlayCircle,
        color: 'text-blue-500 bg-blue-500/10',
        gradient: 'from-blue-500 to-cyan-500'
    },
    document: {
        label: 'Tài liệu',
        icon: FileText,
        color: 'text-emerald-500 bg-emerald-500/10',
        gradient: 'from-emerald-500 to-teal-500'
    },
    flashcard: {
        label: 'Flashcard',
        icon: Sparkles,
        color: 'text-indigo-500 bg-indigo-500/10',
        gradient: 'from-indigo-500 to-violet-500'
    },
    quiz: {
        label: 'Kiểm tra',
        icon: HelpCircle,
        color: 'text-amber-500 bg-amber-500/10',
        gradient: 'from-amber-500 to-orange-500'
    },
    assignment: {
        label: 'Bài tập',
        icon: ClipboardCheck,
        color: 'text-rose-500 bg-rose-500/10',
        gradient: 'from-rose-500 to-orange-500'
    },
};

export const addableLessonTypes = ['video', 'flashcard', 'quiz', 'assignment'];

export const getLessonFlashcardSets = (content) => (
    Array.isArray(content?.flashcardSets)
        ? content.flashcardSets
        : Array.isArray(content?.flashcards)
            ? content.flashcards
            : []
);

export const getFlashcardSetItems = (set) => (
    Array.isArray(set?.items)
        ? set.items
        : Array.isArray(set?.flashcardItems)
            ? set.flashcardItems
            : Array.isArray(set?.cards)
                ? set.cards
                : []
);

export const MAX_FLASHCARD_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const LESSON_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

export function createFlashcardDraft(id) {
    return {
        id,
        itemId: null,
        cardOrder: null,
        frontText: '',
        backText: '',
        frontImageUrl: '',
        backImageUrl: '',
    };
}

export function createFlashcardDraftFromItem(item, fallbackId = 1) {
    return {
        id: fallbackId,
        itemId: item?.flashcardItemId || item?.id || null,
        cardOrder: item?.cardOrder ?? item?.order ?? item?.displayOrder ?? null,
        frontText: item?.frontText || item?.front || '',
        backText: item?.backText || item?.back || '',
        frontImageUrl: resolveFlashcardImageUrl(
            item?.frontImageUrl || item?.frontImage || item?.frontMediaUrl || item?.frontImagePath || ''
        ),
        backImageUrl: resolveFlashcardImageUrl(
            item?.backImageUrl || item?.backImage || item?.backMediaUrl || item?.backImagePath || ''
        ),
    };
}

export const DEFAULT_FLASHCARD_DRAFTS = [createFlashcardDraft(1)];

export function extractUploadedImageUrl(response) {
    const payload = response?.data?.data || response?.data || response || {};
    return payload.imageUrl || payload.url || payload.secure_url || payload.fileUrl || payload.path || '';
}

export function validateLessonForm(form, existingLessons = []) {
    const lessonCode = String(form?.lessonCode || '').trim();
    const lessonName = String(form?.lessonName || '').trim();
    const normalizedCode = lessonCode.toLowerCase();
    const normalizedName = lessonName.toLowerCase();

    const fieldErrors = {};
    let summary = '';

    if (!lessonCode) {
        fieldErrors.lessonCode = 'Cần nhập mã bài giảng để sắp xếp và phân biệt nội dung trong chương.';
    } else if (lessonCode.length < 2) {
        fieldErrors.lessonCode = 'Mã bài giảng nên có ít nhất 2 ký tự, ví dụ: LS01 hoặc QUIZ01.';
    } else if (!LESSON_CODE_PATTERN.test(lessonCode)) {
        fieldErrors.lessonCode = 'Mã bài giảng chỉ nên gồm chữ cái, số, dấu gạch ngang hoặc gạch dưới.';
    } else if (existingLessons.some((lesson) => String(lesson?.lessonCode || '').trim().toLowerCase() === normalizedCode)) {
        fieldErrors.lessonCode = 'Mã bài giảng này đã tồn tại trong chương. Hãy chọn mã khác để tránh bị trùng.';
    }

    if (!lessonName) {
        fieldErrors.lessonName = 'Cần nhập tên bài giảng để học viên nhận ra đúng nội dung cần học.';
    } else if (lessonName.length < 3) {
        fieldErrors.lessonName = 'Tên bài giảng hơi ngắn. Nên nhập ít nhất 3 ký tự để hiển thị rõ ràng hơn.';
    } else if (existingLessons.some((lesson) => String(lesson?.lessonName || '').trim().toLowerCase() === normalizedName)) {
        fieldErrors.lessonName = 'Tên bài giảng này đã có trong chương. Hãy đổi tên để người học không bị nhầm.';
    }

    if (fieldErrors.lessonCode) {
        summary = fieldErrors.lessonCode;
    } else if (fieldErrors.lessonName) {
        summary = fieldErrors.lessonName;
    }

    return {
        isValid: Object.keys(fieldErrors).length === 0,
        fieldErrors,
        summary,
    };
}

export function validateChapterForm(form) {
    const chapterCode = String(form?.chapterCode || '').trim();
    const chapterName = String(form?.chapterName || '').trim();

    const fieldErrors = {};
    let summary = '';

    if (!chapterCode) {
        fieldErrors.chapterCode = 'Cần nhập mã chương để phân biệt nội dung.';
    } else if (chapterCode.length < 2) {
        fieldErrors.chapterCode = 'Mã chương nên có ít nhất 2 ký tự.';
    } else if (!LESSON_CODE_PATTERN.test(chapterCode)) {
        fieldErrors.chapterCode = 'Mã chương chỉ nên gồm chữ cái, số, dấu gạch ngang hoặc gạch dưới.';
    }

    if (!chapterName) {
        fieldErrors.chapterName = 'Cần nhập tên chương để hiển thị trong giáo trình.';
    } else if (chapterName.length < 3) {
        fieldErrors.chapterName = 'Tên chương nên có ít nhất 3 ký tự để hiển thị rõ ràng hơn.';
    }

    if (fieldErrors.chapterCode) {
        summary = fieldErrors.chapterCode;
    } else if (fieldErrors.chapterName) {
        summary = fieldErrors.chapterName;
    }

    return {
        isValid: Object.keys(fieldErrors).length === 0,
        fieldErrors,
        summary,
    };
}

export function normalizeDurationMinutes(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.round(parsed);
}

export function getLessonDurationMinutes(source = {}) {
    return normalizeDurationMinutes(
        source?.timeLimitMinutes
        ?? source?.estimatedDurationMinutes
        ?? source?.durationMinutes
        ?? 0
    );
}

export function formatDurationMinutes(minutes) {
    const normalized = normalizeDurationMinutes(minutes);
    if (!normalized) return 'Không giới hạn';
    if (normalized < 60) return `${normalized} phút`;
    const hours = Math.floor(normalized / 60);
    const remainingMinutes = normalized % 60;
    return remainingMinutes > 0 
        ? `${hours} giờ ${remainingMinutes} phút` 
        : `${hours} giờ`;
}

export function buildQuestionEditorInitialState(question = {}) {
    const questionType = String(question?.questionType || 'multiple_choice').trim().toLowerCase() || 'multiple_choice';
    const difficultyLevel = ['easy', 'medium', 'hard'].includes(question?.difficultyLevel)
        ? question.difficultyLevel
        : 'medium';

    let options = Array.isArray(question?.options)
        ? question.options.map((option, index) => ({
            id: option?.optionId || `option-${index + 1}`,
            optionText: String(option?.optionText || '').trim(),
            isCorrect: Boolean(option?.isCorrect),
        }))
        : [];

    if (questionType === 'true_false') {
        const hasTrueCorrect = options.find((option) => 
            String(option?.optionText || '').trim().toLowerCase() === 'đúng' && option.isCorrect
        );

        options = [
            { id: 'true-option', optionText: 'Đúng', isCorrect: Boolean(hasTrueCorrect || options[0]?.isCorrect) },
            { id: 'false-option', optionText: 'Sai', isCorrect: !(hasTrueCorrect || options[0]?.isCorrect) },
        ];
    }

    if (options.length === 0) {
        options = [
            { id: 'option-1', optionText: '', isCorrect: true },
            { id: 'option-2', optionText: '', isCorrect: false },
            { id: 'option-3', optionText: '', isCorrect: false },
            { id: 'option-4', optionText: '', isCorrect: false },
        ];
    }

    return {
        questionText: String(question?.questionText || '').trim(),
        questionType,
        difficultyLevel,
        questionExplanation: String(question?.questionExplanation || '').trim(),
        options,
    };
}

export function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname.includes('youtube.com')) {
            const videoId = parsedUrl.searchParams.get('v');
            return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
        }
        if (parsedUrl.hostname.includes('youtu.be')) {
            const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
            return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
        }
    } catch {
        return '';
    }
    return '';
}