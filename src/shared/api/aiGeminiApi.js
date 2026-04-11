import axiosClient from "./axiosClient";
import geminiApi from "./geminiApi";

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
                || ''
            ).trim();
            const questionType = normalizeQuestionType(question?.questionType);
            const difficultyLevel = normalizeDifficultyLevel(
                question?.difficultyLevel || question?.difficulty
            );

            const options = Array.isArray(question?.options)
                ? question.options
                    .map((option, index) => ({
                        optionText: String(option?.optionText || '').trim(),
                        isCorrect: Boolean(option?.isCorrect),
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

const aiGeminiApi = {
    async generateQuestions({
        content,
        questionCount = 3,
        difficulty = 'medium',
        language = 'vi',
    }) {
        const trimmedContent = String(content || '').trim();
        if (!trimmedContent) {
            throw new Error('Thiếu nội dung để tạo câu hỏi bằng AI.');
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
                throw new Error('AI backend chưa trả về câu hỏi hợp lệ.');
            }

            return normalizedQuestions;
        } catch (error) {
            const status = error?.response?.status;
            const backendMessage = error?.response?.data?.message || error?.message;

            // Keep quiz on backend by default, but fall back to direct Gemini if backend AI is unavailable.
            if (status === 503) {
                try {
                    return await geminiApi.generateQuizQuestions({
                        sourceText: trimmedContent,
                        count: questionCount,
                        contextTitle: '',
                    });
                } catch (fallbackError) {
                    throw new Error(
                        fallbackError?.response?.data?.message
                        || fallbackError?.message
                        || backendMessage
                        || 'Dịch vụ AI hiện chưa khả dụng.'
                    );
                }
            }

            throw new Error(
                backendMessage || 'Không thể tạo câu hỏi bằng AI lúc này.'
            );
        }
    },
};

export default aiGeminiApi;
