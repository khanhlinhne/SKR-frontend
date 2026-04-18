import axiosClient from './axiosClient';
import geminiApi from './geminiApi';

const CHAT_ENDPOINT = '/ai-gemini/chat';

function firstObject(...values) {
    return values.find((value) => value && typeof value === 'object' && !Array.isArray(value));
}

function firstArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function createThreadId() {
    return `learner_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeHistoryMessages(messages) {
    if (!Array.isArray(messages)) {
        return [];
    }

    return messages
        .map((item) => {
            const role = String(item?.role || '').trim().toLowerCase();
            const content = String(item?.content || '').trim();

            if (!content) {
                return null;
            }

            if (role === 'assistant' || role === 'model' || role === 'ai') {
                return { role: 'assistant', content };
            }

            if (role === 'user') {
                return { role: 'user', content };
            }

            return null;
        })
        .filter(Boolean);
}

function normalizeSuggestion(item) {
    if (typeof item === 'string') {
        return item.trim();
    }

    return String(item?.label || item?.text || item?.title || '').trim();
}

function normalizeSource(item, index) {
    return {
        id: String(item?.id || item?.sourceId || `source-${index}`),
        label: String(item?.label || item?.title || item?.name || 'Nguồn dữ liệu'),
        type: String(item?.type || item?.kind || 'data'),
    };
}

function normalizeChatResponse(response, fallbackThreadId) {
    const payload = firstObject(response?.data, response) || {};
    const meta = firstObject(payload.meta, payload.metadata, payload.debug) || {};
    const answer =
        String(
            payload.answer ||
            payload.reply ||
            payload.message ||
            payload.output ||
            payload.text ||
            '',
        ).trim() || 'Mình chưa có câu trả lời phù hợp.';

    return {
        threadId: String(payload.threadId || payload.conversationId || fallbackThreadId || createThreadId()),
        answer,
        toolsUsed: firstArray(payload.toolsUsed, payload.tools, payload.metadata?.toolsUsed).map((item) => String(item).trim()).filter(Boolean),
        suggestions: firstArray(
            payload.suggestions,
            payload.followUpSuggestions,
            payload.followUpQuestions,
            payload.followups,
        ).map(normalizeSuggestion).filter(Boolean),
        data: firstObject(payload.data, payload.contextData, payload.resultData) || null,
        sources: firstArray(payload.sources, payload.references, payload.citations).map(normalizeSource),
        meta: {
            usedFallback: Boolean(payload.usedFallback ?? meta.usedFallback),
            provider: String(payload.provider || meta.provider || meta.usedProvider || '').trim(),
            model: String(payload.model || meta.model || meta.usedModel || '').trim(),
        },
        raw: payload,
    };
}

function shouldFallbackToDirectGemini(error) {
    const status = error?.response?.status;
    const message = String(
        error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || '',
    ).trim().toLowerCase();

    return !status
        || status === 404
        || status === 405
        || status === 408
        || status === 429
        || status >= 500
        || /(route not found|quota|rate limit|too many requests|resource exhausted|temporarily unavailable|unavailable|overloaded)/.test(message);
}

const learnerAiApi = {
    createThreadId,

    async sendMessage({ message, threadId, messages = [] }) {
        const resolvedThreadId = threadId || createThreadId();
        const normalizedMessages = normalizeHistoryMessages(messages);
        const payload = {
            message,
        };

        // Keep the first request close to the backend's simplest accepted contract.
        if (normalizedMessages.length > 1) {
            payload.messages = normalizedMessages;
        }

        try {
            const response = await axiosClient.post(CHAT_ENDPOINT, payload, {
                timeout: 60000,
            });

            return normalizeChatResponse(response, resolvedThreadId);
        } catch (error) {
            if (!shouldFallbackToDirectGemini(error)) {
                throw error;
            }

            const fallbackResponse = await geminiApi.chatWithLearnerAssistant({
                message,
                messages: normalizedMessages,
            });

            return {
                threadId: resolvedThreadId,
                answer: fallbackResponse.answer,
                toolsUsed: ['gemini-direct-fallback'],
                suggestions: fallbackResponse.suggestions,
                data: null,
                sources: [],
                meta: {
                    usedFallback: true,
                    provider: fallbackResponse.provider,
                    model: fallbackResponse.model,
                },
                raw: fallbackResponse,
            };
        }
    },
};

export default learnerAiApi;
