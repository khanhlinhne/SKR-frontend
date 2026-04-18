const LESSON_TYPE_ALIASES = {
    assigment: 'assignment',
    test: 'quiz',
    tests: 'quiz',
    'practice-test': 'quiz',
    practice_test: 'quiz',
};

export const SUPPORTED_LESSON_TYPES = new Set([
    'video',
    'document',
    'flashcard',
    'quiz',
    'assignment',
]);

export function normalizeLessonType(value, fallback = '') {
    const normalizedValue = String(value || '').trim().toLowerCase();
    if (!normalizedValue) {
        return fallback;
    }

    return LESSON_TYPE_ALIASES[normalizedValue] || normalizedValue;
}

export function isSupportedLessonType(value) {
    return SUPPORTED_LESSON_TYPES.has(normalizeLessonType(value));
}
