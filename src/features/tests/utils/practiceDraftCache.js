const PRACTICE_DRAFT_CACHE_KEY = 'skr-practice-draft-cache';

function safeParse(value, fallback) {
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function readCacheMap() {
    if (typeof window === 'undefined') return {};
    return safeParse(localStorage.getItem(PRACTICE_DRAFT_CACHE_KEY), {});
}

function writeCacheMap(value) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PRACTICE_DRAFT_CACHE_KEY, JSON.stringify(value));
}

function normalizeText(value) {
    return String(value || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

export function buildPracticeDraftFingerprint(source = {}) {
    return [
        normalizeText(source?.testTitle),
        normalizeText(source?.testDescription),
        String(source?.courseId || source?.subjectId || '').trim(),
    ].join('::');
}

function resolveCacheKeys(source = {}) {
    const keys = [];
    const practiceTestId = String(source?.practiceTestId || '').trim();
    const fingerprint = buildPracticeDraftFingerprint(source);

    if (practiceTestId) {
        keys.push(`id:${practiceTestId}`);
    }

    if (fingerprint.replace(/:/g, '')) {
        keys.push(`fp:${fingerprint}`);
    }

    return keys;
}

export function savePracticeDraft(source = {}) {
    const keys = resolveCacheKeys(source);
    if (keys.length === 0) return;

    const cacheMap = readCacheMap();
    const entry = {
        practiceTestId: source?.practiceTestId || null,
        testTitle: source?.testTitle || '',
        testDescription: source?.testDescription || '',
        courseId: source?.courseId || null,
        subjectId: source?.subjectId || null,
        subjectName: source?.subjectName || '',
        timeLimitMinutes: source?.timeLimitMinutes || 30,
        randomizeQuestions: source?.randomizeQuestions !== false,
        randomizeOptions: source?.randomizeOptions !== false,
        showCorrectAnswers: source?.showCorrectAnswers !== false,
        difficultyLevels: Array.isArray(source?.difficultyLevels) ? source.difficultyLevels : ['medium'],
        questionTypes: Array.isArray(source?.questionTypes) ? source.questionTypes : ['multiple_choice'],
        totalQuestions: Number(source?.totalQuestions) || 0,
        manualQuestions: Array.isArray(source?.manualQuestions) ? source.manualQuestions : [],
        updatedAt: new Date().toISOString(),
    };

    keys.forEach((key) => {
        cacheMap[key] = entry;
    });

    writeCacheMap(cacheMap);
}

export function getPracticeDraft(source = {}) {
    const cacheMap = readCacheMap();
    const keys = resolveCacheKeys(source);

    for (const key of keys) {
        if (cacheMap[key]) {
            return cacheMap[key];
        }
    }

    return null;
}

export function pickFirstPopulatedArray(...candidates) {
    for (const candidate of candidates) {
        if (Array.isArray(candidate) && candidate.length > 0) {
            return candidate;
        }
    }

    return [];
}
