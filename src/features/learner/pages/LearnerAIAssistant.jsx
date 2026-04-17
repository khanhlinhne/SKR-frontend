import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
    ArrowUp,
    Bot,
    Brain,
    Clock3,
    MessageSquare,
    RefreshCw,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { DashboardSidebar } from '@/features/learner/components';
import { learnerAiApi } from '@/shared/api';
import { useCurrentUserProfile, getUserInitials } from '@/shared/user';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.12 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const SUGGESTED_PROMPTS = [
    'Hôm nay tôi đã học bao lâu?',
    'Khóa học nào của tôi có tiến độ cao nhất?',
    'Tôi nên ôn gì hôm nay?',
    'Môn học gần đây nhất của tôi là gì?',
];

function createAssistantMessage(content, extra = {}) {
    return {
        id: `assistant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        role: 'assistant',
        content,
        toolsUsed: extra.toolsUsed || [],
        suggestions: extra.suggestions || [],
        data: extra.data || null,
        sources: extra.sources || [],
        meta: extra.meta || null,
        localOnly: Boolean(extra.localOnly),
    };
}

function createUserMessage(content) {
    return {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        role: 'user',
        content,
    };
}

export default function LearnerAIAssistant() {
    const { profile } = useCurrentUserProfile();
    const [threadId, setThreadId] = useState(() => learnerAiApi.createThreadId());
    const [messages, setMessages] = useState(() => ([
        createAssistantMessage(
            'Mình có thể trả lời bằng dữ liệu học tập thực tế của bạn như thời gian học, tiến độ khóa học, lịch ôn tập và thống kê học tập.',
            { suggestions: SUGGESTED_PROMPTS, localOnly: true },
        ),
    ]));
    const [draft, setDraft] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const displayName = profile.name || 'Người dùng';
    const greetingName = useMemo(() => {
        const parts = displayName.trim().split(/\s+/).filter(Boolean);
        return parts[parts.length - 1] || displayName;
    }, [displayName]);

    async function handleSendMessage(rawMessage) {
        const message = String(rawMessage || '').trim();
        if (!message || submitting) {
            return;
        }

        const userMessage = createUserMessage(message);
        const nextMessages = [...messages.filter((item) => !item.localOnly), userMessage];
        setMessages((current) => [...current, userMessage]);
        setDraft('');
        setSubmitting(true);
        setError('');

        try {
            const response = await learnerAiApi.sendMessage({
                message,
                threadId,
                messages: nextMessages,
            });

            setThreadId(response.threadId);
            setMessages((current) => [
                ...current,
                createAssistantMessage(response.answer, {
                    toolsUsed: response.toolsUsed,
                    suggestions: response.suggestions,
                    data: response.data,
                    sources: response.sources,
                    meta: response.meta,
                }),
            ]);
        } catch (sendError) {
            if (import.meta.env.DEV) {
                console.error('Learner AI chat request failed', sendError);
            }
            const statusCode = sendError?.response?.status;
            const isTimeout = sendError?.code === 'ECONNABORTED';
            const errorMessage =
                sendError?.response?.data?.message
                || sendError?.response?.data?.error
                || (isTimeout ? 'Yeu cau AI bi timeout sau 60 giay. Backend da tra loi qua cham.' : '')
                || sendError?.message
                || (statusCode ? `Request that bai voi ma ${statusCode}.` : '')
                || 'Không thể gửi câu hỏi tới trợ lý AI lúc này.';
            setError(errorMessage);
            setMessages((current) => [
                ...current,
                createAssistantMessage('Mình chưa thể lấy dữ liệu lúc này. Bạn thử lại sau ít phút.', { localOnly: true }),
            ]);
        } finally {
            setSubmitting(false);
        }
    }

    function handleResetConversation() {
        setThreadId(learnerAiApi.createThreadId());
        setMessages([
            createAssistantMessage(
                'Cuộc trò chuyện mới đã sẵn sàng. Bạn có thể hỏi về tiến độ học, flashcards, bài test hoặc lịch ôn tập.',
                { suggestions: SUGGESTED_PROMPTS, localOnly: true },
            ),
        ]);
        setDraft('');
        setError('');
    }

    return (
        <div className="flex h-screen overflow-hidden bg-base-200">
            <DashboardSidebar />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <motion.main
                    className="flex-1 overflow-y-auto p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.section variants={cardVariants} className="mb-6 rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-lg">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Learner AI Assistant
                                </div>
                                <h1 className="text-2xl font-black text-base-content lg:text-3xl">Chào {greetingName}, bạn muốn hỏi gì hôm nay?</h1>
                                <p className="mt-2 max-w-3xl text-sm text-base-content/60">
                                    Hỏi về thời gian học, khóa học đang học, lịch ôn tập, flashcards, bài test hoặc gợi ý học tiếp theo dựa trên dữ liệu thật của bạn.
                                </p>
                            </div>

                            <button
                                onClick={handleResetConversation}
                                className="btn btn-outline rounded-xl font-bold"
                                disabled={submitting}
                            >
                                <Trash2 className="h-4 w-4" />
                                Cuộc trò chuyện mới
                            </button>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {SUGGESTED_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => handleSendMessage(prompt)}
                                    className="rounded-full border border-base-300 bg-base-100 px-3 py-2 text-sm font-semibold text-base-content/70 transition-colors hover:border-blue-500/30 hover:text-blue-600"
                                    disabled={submitting}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </motion.section>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <motion.section variants={cardVariants} className="flex min-h-[680px] flex-col rounded-[2rem] border border-base-300 bg-base-100 shadow-lg">
                            <div className="flex items-center justify-between border-b border-base-300 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg">
                                        <Brain className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-base-content">Trợ lý học tập</h2>
                                        <p className="text-xs text-base-content/50">Trả lời bằng dữ liệu học tập của riêng bạn</p>
                                    </div>
                                </div>

                                {submitting ? (
                                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
                                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                        Đang trả lời
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                                {messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        displayName={displayName}
                                        avatarUrl={profile.avatarUrl}
                                        onSendSuggestion={handleSendMessage}
                                        submitting={submitting}
                                    />
                                ))}
                            </div>

                            <div className="border-t border-base-300 px-4 py-4">
                                {error ? (
                                    <div className="mb-3 rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-medium text-error">
                                        {error}
                                    </div>
                                ) : null}

                                <div className="rounded-[1.5rem] border border-base-300 bg-base-200/40 p-3">
                                    <textarea
                                        value={draft}
                                        onChange={(event) => setDraft(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' && !event.shiftKey) {
                                                event.preventDefault();
                                                void handleSendMessage(draft);
                                            }
                                        }}
                                        placeholder="Hỏi về tiến độ học, thời gian học hôm nay, môn học gần đây, lịch ôn tập..."
                                        className="textarea h-28 w-full resize-none border-none bg-transparent px-2 text-sm focus:outline-none"
                                        disabled={submitting}
                                    />

                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <p className="text-xs text-base-content/50">Nhấn Enter để gửi, Shift + Enter để xuống dòng</p>
                                        <button
                                            onClick={() => handleSendMessage(draft)}
                                            disabled={!draft.trim() || submitting}
                                            className="btn rounded-xl border-none bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-white hover:from-blue-700 hover:to-violet-700 disabled:bg-base-300 disabled:text-base-content/40"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                            Gửi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        <motion.aside variants={cardVariants} className="space-y-6">
                            <div className="rounded-[2rem] border border-base-300 bg-base-100 p-5 shadow-lg">
                                <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-base-content/60">Có thể hỏi gì?</h3>
                                <div className="space-y-3">
                                    <InfoCard
                                        icon={Clock3}
                                        title="Thời gian học"
                                        description="Hôm nay tôi học bao lâu, tuần này học mấy giờ, thời điểm nào học nhiều nhất."
                                    />
                                    <InfoCard
                                        icon={Brain}
                                        title="Tiến độ học"
                                        description="Khóa nào tiến độ cao nhất, môn gần đây nhất, còn bao nhiêu bài chưa học."
                                    />
                                    <InfoCard
                                        icon={MessageSquare}
                                        title="Ôn tập thông minh"
                                        description="Hôm nay nên ôn gì, còn lịch spaced repetition nào, gợi ý học tiếp theo."
                                    />
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                </motion.main>
            </div>
        </div>
    );
}

function MessageBubble({ message, displayName, avatarUrl, onSendSuggestion, submitting }) {
    const isAssistant = message.role === 'assistant';
    const isFallback = Boolean(message.meta?.usedFallback);
    const modelLabel = [message.meta?.provider, message.meta?.model].filter(Boolean).join(' / ');

    return (
        <div className={`flex gap-3 ${isAssistant ? 'items-start' : 'justify-end'}`}>
            {isAssistant ? <MessageAvatar role="assistant" /> : null}

            <div className={`max-w-[85%] ${isAssistant ? '' : 'order-first'}`}>
                <div className={`rounded-[1.5rem] px-4 py-3 shadow-sm ${isAssistant ? 'bg-base-200 text-base-content' : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white'}`}>
                    {isAssistant && (isFallback || modelLabel) ? (
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                            {isFallback ? (
                                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-amber-700">
                                    Dang dung fallback backend
                                </span>
                            ) : null}
                            {modelLabel ? (
                                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-blue-700">
                                    {modelLabel}
                                </span>
                            ) : null}
                        </div>
                    ) : null}

                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>

                {isAssistant && message.suggestions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => onSendSuggestion(suggestion)}
                                className="rounded-full border border-base-300 px-3 py-1 text-[11px] font-semibold text-base-content/60 transition-colors hover:border-blue-500/30 hover:text-blue-600"
                                disabled={submitting}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                ) : null}

                {isAssistant && message.toolsUsed?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {message.toolsUsed.map((tool) => (
                            <span key={tool} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                                {tool}
                            </span>
                        ))}
                    </div>
                ) : null}

                {!isAssistant ? (
                    <div className="mt-2 text-right text-[11px] font-semibold text-base-content/45">{displayName}</div>
                ) : null}
            </div>

            {!isAssistant ? <MessageAvatar role="user" displayName={displayName} avatarUrl={avatarUrl} /> : null}
        </div>
    );
}

function MessageAvatar({ role, displayName, avatarUrl }) {
    if (role === 'assistant') {
        return (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg">
                <Bot className="h-5 w-5" />
            </div>
        );
    }

    return (
        <div className="avatar h-11 w-11 shrink-0">
            <div className="w-11 overflow-hidden rounded-2xl bg-base-200 ring ring-base-300">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-11 w-11 object-cover" />
                ) : (
                    <div className="flex h-11 w-11 items-center justify-center text-xs font-black text-base-content">
                        {getUserInitials(displayName || 'U')}
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoCard({ icon: Icon, title, description }) {
    return (
        <div className="rounded-2xl bg-base-200/40 p-4">
            <div className="mb-2 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                    <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-black text-base-content">{title}</h4>
            </div>
            <p className="text-xs leading-relaxed text-base-content/60">{description}</p>
        </div>
    );
}
