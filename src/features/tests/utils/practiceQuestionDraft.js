function normalizeOptionText(option) {
    return String(
        option?.optionText
        || option?.text
        || option?.answerText
        || option?.content
        || option?.optionContent
        || option?.answer
        || option?.label
        || '',
    ).trim();
}

function extractQuestionText(question) {
    return String(
        question?.questionText
        || question?.content
        || question?.questionContent
        || question?.title
        || question?.text
        || question?.prompt
        || question?.question?.questionText
        || question?.question?.content
        || '',
    ).trim();
}

function normalizeQuestionType(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === 'true_false' || normalized === 'true/false' || normalized === 'boolean'
        ? 'true_false'
        : 'multiple_choice';
}

function normalizeCorrectFlag(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;

    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return false;

    return normalized === 'true'
        || normalized === '1'
        || normalized === 'yes'
        || normalized === 'correct';
}

function extractOptions(question) {
    const directOptions = [
        question?.options,
        question?.questionOptions,
        question?.answers,
        question?.answerOptions,
        question?.choices,
        question?.question?.options,
        question?.question?.questionOptions,
        question?.question?.answers,
    ].find(Array.isArray);

    return Array.isArray(directOptions) ? directOptions : [];
}

function looksLikeQuestion(item) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    if (extractQuestionText(item)) return true;
    return extractOptions(item).length > 0;
}

function findQuestionsInPayload(source, depth = 0) {
    if (!source || depth > 4) return [];

    if (Array.isArray(source)) {
        if (source.some(looksLikeQuestion)) {
            return source;
        }

        for (const item of source) {
            const nested = findQuestionsInPayload(item, depth + 1);
            if (nested.length > 0) {
                return nested;
            }
        }
        return [];
    }

    if (typeof source !== 'object') {
        return [];
    }

    const preferredKeys = [
        'questions',
        'practiceQuestions',
        'practiceTestQuestions',
        'quizQuestions',
        'items',
        'data',
        'practice',
        'detail',
        'attempt',
        'review',
    ];

    for (const key of preferredKeys) {
        const nested = findQuestionsInPayload(source?.[key], depth + 1);
        if (nested.length > 0) {
            return nested;
        }
    }

    for (const value of Object.values(source)) {
        const nested = findQuestionsInPayload(value, depth + 1);
        if (nested.length > 0) {
            return nested;
        }
    }

    return [];
}

export function buildManualQuestionFromSource(question, index = 0) {
    const normalizedType = normalizeQuestionType(
        question?.questionType || question?.type || question?.question?.questionType,
    );
    const rawOptions = extractOptions(question);
    const normalizedOptions = rawOptions
        .map((option, optionIndex) => ({
            optionText: normalizeOptionText(option),
            isCorrect: normalizeCorrectFlag(option?.isCorrect)
                || normalizeCorrectFlag(option?.correct)
                || normalizeCorrectFlag(option?.isAnswer)
                || normalizeCorrectFlag(option?.isRight)
                || option?.optionId === question?.correctOptionId
                || option?.id === question?.correctOptionId
                || optionIndex === Number(question?.correctOptionIndex),
        }))
        .filter((option) => option.optionText);

    const firstCorrectIndex = normalizedOptions.findIndex((option) => option.isCorrect);
    const sanitizedOptions = normalizedType === 'multiple_choice'
        ? normalizedOptions.map((option, optionIndex) => ({
            ...option,
            isCorrect: optionIndex === (firstCorrectIndex >= 0 ? firstCorrectIndex : 0),
        }))
        : normalizedOptions;

    const trueFalseAnswer = sanitizedOptions.find((option) => option.isCorrect)?.optionText === 'Sai' ? 'false' : 'true';

    return {
        id: question?.questionId || question?.id || question?.practiceQuestionId || question?.question?.questionId || Date.now() + index,
        questionText: extractQuestionText(question),
        questionType: normalizedType,
        trueFalseAnswer,
        options: normalizedType === 'true_false'
            ? [
                { optionText: 'Đúng', isCorrect: trueFalseAnswer === 'true' },
                { optionText: 'Sai', isCorrect: trueFalseAnswer === 'false' },
            ]
            : sanitizedOptions,
    };
}

export function extractPracticeManualQuestions(source) {
    const questions = findQuestionsInPayload(source);

    return questions
        .map((question, index) => buildManualQuestionFromSource(question, index))
        .filter((question) => question.questionText)
        .map((question) => (
            question.questionType === 'multiple_choice' && (!Array.isArray(question.options) || question.options.length === 0)
                ? {
                    ...question,
                    options: [
                        { optionText: '', isCorrect: true },
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false },
                    ],
                }
                : question
        ));
}
