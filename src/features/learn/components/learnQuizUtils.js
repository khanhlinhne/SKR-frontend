export const QUIZ_TEXT_QUESTION_TYPES = new Set(['fill_blank', 'fill_in_blank', 'short_answer']);

export const QUIZ_DIFFICULTY_STYLES = {
    easy: 'bg-emerald-500/10 text-emerald-700',
    medium: 'bg-amber-500/10 text-amber-700',
    hard: 'bg-rose-500/10 text-rose-700',
};

export function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

export function isTextQuestion(question = {}) {
    return QUIZ_TEXT_QUESTION_TYPES.has(question.questionType);
}

export function normalizeQuestions(lesson) {
    return Array.isArray(lesson?.questions)
        ? lesson.questions.map((question, index) => ({
            ...question,
            displayId: question.questionId || question.id || `lesson-question-${index}`,
            options: Array.isArray(question.options)
                ? [...question.options].sort((a, b) => (a.optionOrder ?? 0) - (b.optionOrder ?? 0))
                : [],
        }))
        : [];
}

export function isQuestionAnswered(question, answer) {
    if (!question) return false;
    if (isTextQuestion(question)) {
        return normalizeText(answer).length > 0;
    }
    return Array.isArray(answer) && answer.length > 0;
}

export function getQuizTimeLimitMinutes(lesson = {}) {
    const parsed = Number(
        lesson?.timeLimitMinutes
        ?? lesson?.estimatedDurationMinutes
        ?? lesson?.durationMinutes
        ?? 0
    );

    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.round(parsed);
}

export function formatTimeLeft(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatTimeLimitLabel(minutes) {
    if (!minutes) return 'Không giới hạn';
    if (minutes < 60) return `${minutes} phút`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
        ? `${hours} giờ ${remainingMinutes} phút`
        : `${hours} giờ`;
}

export function formatDifficultyLabel(level) {
    switch (normalizeText(level)) {
        case 'easy':
            return 'Dễ';
        case 'hard':
            return 'Khó';
        case 'medium':
        default:
            return 'Trung bình';
    }
}

export function summarizeQuestionDifficulties(questions = []) {
    return questions.reduce((summary, question) => {
        const level = normalizeText(question?.difficultyLevel) || 'medium';
        summary[level] = (summary[level] || 0) + 1;
        return summary;
    }, { easy: 0, medium: 0, hard: 0 });
}

export function evaluateQuizAttempt({
    questions = [],
    answers = {},
    timeSpentSeconds = null,
    timeLeft = null,
    submitReason = 'manual',
}) {
    const reviewItems = questions.map((question) => {
        const answer = answers[question.displayId];
        const correctOptions = question.options.filter((option) => option.isCorrect);
        const correctOptionIds = correctOptions
            .map((option) => option.optionId)
            .filter(Boolean);
        const correctTexts = correctOptions
            .map((option) => normalizeText(option.optionText))
            .filter(Boolean);

        const answerIsText = isTextQuestion(question);
        const selectedOptionIds = Array.isArray(answer) ? answer : [];
        const userAnswerText = answerIsText ? String(answer || '').trim() : '';
        const normalizedUserAnswerText = normalizeText(userAnswerText);
        const answered = isQuestionAnswered(question, answer);

        const isCorrect = answerIsText
            ? Boolean(normalizedUserAnswerText) && correctTexts.includes(normalizedUserAnswerText)
            : selectedOptionIds.length === correctOptionIds.length
                && correctOptionIds.every((optionId) => selectedOptionIds.includes(optionId))
                && selectedOptionIds.length > 0;

        return {
            ...question,
            answer,
            answered,
            isCorrect,
            userAnswerText,
            selectedOptionIds,
            correctOptionIds,
            correctTexts,
        };
    });

    const totalQuestions = reviewItems.length;
    const answeredCount = reviewItems.filter((item) => item.answered).length;
    const correctCount = reviewItems.filter((item) => item.isCorrect).length;
    const skippedCount = totalQuestions - answeredCount;
    const incorrectCount = answeredCount - correctCount;

    return {
        totalQuestions,
        answeredCount,
        correctCount,
        incorrectCount,
        skippedCount,
        percentage: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
        timeSpentSeconds,
        timeLeft,
        submitReason,
        reviewItems,
    };
}
