import axiosClient from './axiosClient';
import geminiApi from './geminiApi';

function normalizeQuestionType(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'true_false') {
        return 'true_false';
    }
    return 'multiple_choice';
}

function normalizeDifficultyLevel(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'easy' || normalized === 'hard') {
        return normalized;
    }
    return 'medium';
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

function normalizeGeneratedQuestions(questions) {
    if (!Array.isArray(questions)) {
        return [];
    }

    return questions
        .map((question) => {
            const questionText = String(question?.questionText || '').trim();
            const questionExplanation = String(
                question?.questionExplanation
                || question?.explanation
                || '',
            ).trim();
            const questionType = normalizeQuestionType(question?.questionType);
            const difficultyLevel = normalizeDifficultyLevel(
                question?.difficultyLevel || question?.difficulty,
            );

            const options = Array.isArray(question?.options)
                ? question.options
                    .map((option, index) => ({
                        optionText: String(option?.optionText || '').trim(),
                        isCorrect: normalizeCorrectFlag(option?.isCorrect),
                        optionOrder: index,
                    }))
                    .filter((option) => option.optionText)
                : [];

            if (!questionText || options.length < 2) {
                return null;
            }

            const firstCorrectIndex = options.findIndex((option) => option.isCorrect);
            if (questionType === 'multiple_choice') {
                options.forEach((option, index) => {
                    option.isCorrect = index === (firstCorrectIndex >= 0 ? firstCorrectIndex : 0);
                });
            } else if (firstCorrectIndex < 0) {
                options[0].isCorrect = true;
            }

            return {
                questionText,
                questionType,
                difficultyLevel,
                questionExplanation,
                options,
            };
        })
        .filter(Boolean);
}

function extractQuestionsPayload(response) {
    const payload = response?.data?.data || response?.data || response || {};
    if (Array.isArray(payload?.questions)) {
        return payload.questions;
    }
    if (Array.isArray(payload?.generation?.questions)) {
        return payload.generation.questions;
    }
    return [];
}

function shouldFallbackToDirectGemini(error) {
    const status = error?.response?.status;
    const message = String(
        error?.response?.data?.message
        || error?.message
        || '',
    ).trim().toLowerCase();

    return !status
        || status === 404
        || status === 405
        || status === 408
        || status === 429
        || status >= 500
        || /(quota|rate limit|too many requests|resource exhausted|temporarily unavailable|unavailable|overloaded)/.test(message);
}

const aiGeminiApi = {
    async generateQuestions({
        content,
        questionCount = 3,
        difficulty = 'medium',
        language = 'vi',
    }) {
        const trimmedContent = String(content || '').trim();
        if (!trimmedContent) {
            throw new Error('Thieu noi dung de tao cau hoi bang AI.');
        }

        try {
            const response = await axiosClient.post('/ai-gemini/generate-questions', {
                content: trimmedContent,
                questionCount: Math.max(1, Math.min(20, Number(questionCount) || 3)),
                difficulty,
                language,
            });

            const normalizedQuestions = normalizeGeneratedQuestions(extractQuestionsPayload(response));
            if (normalizedQuestions.length === 0) {
                throw new Error('AI backend chua tra ve cau hoi hop le.');
            }

            return normalizedQuestions;
        } catch (error) {
            if (shouldFallbackToDirectGemini(error)) {
                return geminiApi.generateQuizQuestions({
                    sourceText: trimmedContent,
                    count: questionCount,
                    contextTitle: '',
                });
            }

            throw new Error(
                error?.response?.data?.message
                || error?.message
                || 'Khong the tao cau hoi bang AI luc nay.',
            );
        }
    },

    async generateAssignment({
        topic,
        criteriaCount = 4,
        contextTitle = '',
        language = 'vi',
    }) {
        const trimmedTopic = String(topic || '').trim();
        if (!trimmedTopic) {
            throw new Error('Thieu chu de de tao assignment bang AI.');
        }

        try {
            const response = await axiosClient.post('/ai-gemini/generate-assignment', {
                topic: trimmedTopic,
                criteriaCount: Math.max(2, Math.min(6, Number(criteriaCount) || 4)),
                contextTitle: String(contextTitle || '').trim(),
                language,
            });

            const payload = response?.data?.data || response?.data || response || {};
            const assignment = payload.assignment || payload.data || payload;

            if (!assignment?.title || !Array.isArray(assignment?.rubricCriteria)) {
                throw new Error('AI backend chua tra ve assignment hop le.');
            }

            return assignment;
        } catch (error) {
            if (shouldFallbackToDirectGemini(error)) {
                return geminiApi.generateAssignmentDraft({
                    sourceText: trimmedTopic,
                    criteriaCount,
                    contextTitle,
                });
            }

            throw new Error(
                error?.response?.data?.message
                || error?.message
                || 'Khong the tao assignment bang AI luc nay.',
            );
        }
    },

    async gradeAssignment({
        assignment,
        learnerAnswer,
        language = 'vi',
    }) {
        const trimmedAnswer = String(learnerAnswer || '').trim();

        try {
            const response = await axiosClient.post('/ai-gemini/grade-assignment', {
                assignment,
                learnerAnswer: trimmedAnswer,
                language,
            });

            const payload = response?.data?.data || response?.data || response || {};
            const grade = payload.grade || payload.data || payload;

            if (!grade || typeof grade?.score !== 'number') {
                throw new Error('AI backend chua tra ve ket qua cham assignment hop le.');
            }

            return grade;
        } catch (error) {
            if (shouldFallbackToDirectGemini(error)) {
                return geminiApi.gradeAssignmentSubmission({
                    assignment,
                    learnerAnswer: trimmedAnswer,
                    language,
                });
            }

            throw new Error(
                error?.response?.data?.message
                || error?.message
                || 'Khong the cham assignment bang AI luc nay.',
            );
        }
    },
};

export default aiGeminiApi;
