import {
    PlayCircle,
    FileText,
    HelpCircle,
    Sparkles,
    ClipboardCheck,
} from 'lucide-react';
import { resolveFlashcardImageUrl } from '@/features/flashcards/utils/imageUrl';

export const lessonTypeConfig = {
    video: { label: 'Video', icon: PlayCircle, color: 'text-blue-500 bg-blue-500/10', gradient: 'from-blue-500 to-cyan-500' },
    document: { label: 'TÃ i liá»‡u', icon: FileText, color: 'text-emerald-500 bg-emerald-500/10', gradient: 'from-emerald-500 to-teal-500' },
    flashcard: { label: 'Flashcard', icon: Sparkles, color: 'text-indigo-500 bg-indigo-500/10', gradient: 'from-indigo-500 to-violet-500' },
    quiz: { label: 'Kiá»ƒm tra', icon: HelpCircle, color: 'text-amber-500 bg-amber-500/10', gradient: 'from-amber-500 to-orange-500' },
    assignment: { label: 'Assignment', icon: ClipboardCheck, color: 'text-rose-500 bg-rose-500/10', gradient: 'from-rose-500 to-orange-500' },
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
            item?.frontImageUrl || item?.frontImage || item?.frontMediaUrl || item?.frontImagePath || '',
        ),
        backImageUrl: resolveFlashcardImageUrl(
            item?.backImageUrl || item?.backImage || item?.backMediaUrl || item?.backImagePath || '',
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
        fieldErrors.lessonCode = 'CÃº cáº§n mÃ£ bÃ i giáº£ng Ä‘á»ƒ sáº¯p xáº¿p vÃ  phÃ¢n biá»‡t ná»™i dung trong chÆ°Æ¡ng.';
    } else if (lessonCode.length < 2) {
        fieldErrors.lessonCode = 'MÃ£ bÃ i giáº£ng nÃªn cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±, vÃ­ dá»¥ LS01 hoáº·c QUIZ01.';
    } else if (!LESSON_CODE_PATTERN.test(lessonCode)) {
        fieldErrors.lessonCode = 'MÃ£ bÃ i giáº£ng chá»‰ nÃªn gá»“m chá»¯ cÃ¡i, sá»‘, dáº¥u gáº¡ch ngang hoáº·c gáº¡ch dÆ°á»›i.';
    } else if (existingLessons.some((lesson) => String(lesson?.lessonCode || '').trim().toLowerCase() === normalizedCode)) {
        fieldErrors.lessonCode = 'MÃ£ bÃ i giáº£ng nÃ y Ä‘Ã£ tá»“n táº¡i trong chÆ°Æ¡ng. Báº¡n hÃ£y chá»n mÃ£ khÃ¡c Ä‘á»ƒ trÃ¡nh bá»‹ trÃ¹ng.';
    }

    if (!lessonName) {
        fieldErrors.lessonName = 'CÃº cáº§n tÃªn bÃ i giáº£ng Ä‘á»ƒ há»c viÃªn nháº­n ra Ä‘Ãºng ná»™i dung cáº§n há»c.';
    } else if (lessonName.length < 3) {
        fieldErrors.lessonName = 'TÃªn bÃ i giáº£ng hÆ¡i ngáº¯n. Báº¡n nÃªn nháº­p Ã­t nháº¥t 3 kÃ½ tá»± Ä‘á»ƒ hiá»ƒn thá»‹ rÃµ rÃ ng hÆ¡n.';
    } else if (existingLessons.some((lesson) => String(lesson?.lessonName || '').trim().toLowerCase() === normalizedName)) {
        fieldErrors.lessonName = 'TÃªn bÃ i giáº£ng nÃ y Ä‘Ã£ cÃ³ trong chÆ°Æ¡ng. Báº¡n hÃ£y Ä‘á»•i tÃªn Ä‘á»ƒ ngÆ°á»i há»c khÃ´ng bá»‹ nháº§m.';
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
        fieldErrors.chapterCode = 'Can nhap ma chuong de phan biet noi dung.';
    } else if (chapterCode.length < 2) {
        fieldErrors.chapterCode = 'Ma chuong nen co it nhat 2 ky tu.';
    } else if (!LESSON_CODE_PATTERN.test(chapterCode)) {
        fieldErrors.chapterCode = 'Ma chuong chi nen gom chu cai, so, dau gach ngang hoac gach duoi.';
    }

    if (!chapterName) {
        fieldErrors.chapterName = 'Can nhap ten chuong de hien thi trong giao trinh.';
    } else if (chapterName.length < 3) {
        fieldErrors.chapterName = 'Ten chuong nen co it nhat 3 ky tu de hien thi ro rang hon.';
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
    if (!normalized) return 'KhÃ´ng giá»›i háº¡n';
    if (normalized < 60) return `${normalized} phÃºt`;
    const hours = Math.floor(normalized / 60);
    const remainingMinutes = normalized % 60;
    return remainingMinutes > 0 ? `${hours} giá» ${remainingMinutes} phÃºt` : `${hours} giá»`;
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
        const hasTrueCorrect = options.find((option) => String(option?.optionText || '').trim().toLowerCase() === 'dung' && option.isCorrect)
            || options.find((option) => String(option?.optionText || '').trim().toLowerCase() === 'Ä‘Ãºng' && option.isCorrect);
        options = [
            { id: 'true-option', optionText: 'Dung', isCorrect: Boolean(hasTrueCorrect || options[0]?.isCorrect) },
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
