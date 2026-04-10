import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, HelpCircle, Loader2, Plus, Sparkles, Trash2, Wand2, X } from 'lucide-react';
import { geminiApi } from '@/shared/api';

const EMPTY_OPTION = { optionText: '', isCorrect: false };
const DEFAULT_AI_QUESTION_COUNT = 3;

function createInitialOptions() {
    return [
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
    ];
}

function createQuestionDraft(id, overrides = {}) {
    return {
        id,
        questionText: '',
        questionType: 'multiple_choice',
        difficultyLevel: 'medium',
        questionExplanation: '',
        options: createInitialOptions(),
        ...overrides,
    };
}

function isQuestionDraftEmpty(question = {}) {
    const hasText = String(question.questionText || '').trim();
    const hasExplanation = String(question.questionExplanation || '').trim();
    const hasOptions = Array.isArray(question.options)
        && question.options.some((option) => String(option?.optionText || '').trim());

    return !hasText && !hasExplanation && !hasOptions;
}

function normalizeGeneratedOptions(options = [], questionType = 'multiple_choice') {
    const normalizedOptions = Array.isArray(options)
        ? options
            .map((option, index) => ({
                optionText: String(option?.optionText || '').trim(),
                isCorrect: Boolean(option?.isCorrect),
                optionOrder: index,
            }))
            .filter((option) => option.optionText)
        : [];

    if (normalizedOptions.length === 0) {
        return createInitialOptions();
    }

    const firstCorrectIndex = normalizedOptions.findIndex((option) => option.isCorrect);
    if (questionType === 'multiple_choice') {
        normalizedOptions.forEach((option, index) => {
            option.isCorrect = index === (firstCorrectIndex >= 0 ? firstCorrectIndex : 0);
        });
    } else if (firstCorrectIndex < 0) {
        normalizedOptions[0].isCorrect = true;
    }

    return normalizedOptions;
}

function createGeneratedQuestionDraft(id, question = {}) {
    const questionType = String(question.questionType || '').trim().toLowerCase() === 'true_false'
        ? 'true_false'
        : 'multiple_choice';

    const difficultyLevel = ['easy', 'medium', 'hard'].includes(question?.difficultyLevel)
        ? question.difficultyLevel
        : 'medium';

    return createQuestionDraft(id, {
        questionText: String(question.questionText || '').trim(),
        questionType,
        difficultyLevel,
        questionExplanation: String(question.questionExplanation || '').trim(),
        options: normalizeGeneratedOptions(question.options, questionType),
    });
}

const DEFAULT_QUESTION_DRAFTS = [createQuestionDraft(1)];

export default function AddQuestionModal({
    open,
    onClose,
    onSubmit,
    loading,
    contextTitle = '',
}) {
    const nextDraftIdRef = useRef(2);
    const [questions, setQuestions] = useState(DEFAULT_QUESTION_DRAFTS);
    const [formError, setFormError] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiQuestionCount, setAiQuestionCount] = useState(DEFAULT_AI_QUESTION_COUNT);
    const [aiGenerating, setAiGenerating] = useState(false);

    const resetForm = () => {
        nextDraftIdRef.current = 2;
        setQuestions([createQuestionDraft(1)]);
        setFormError('');
        setAiPrompt('');
        setAiQuestionCount(DEFAULT_AI_QUESTION_COUNT);
        setAiGenerating(false);
    };

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open]);

    const addQuestion = () => {
        setQuestions((prev) => [...prev, createQuestionDraft(nextDraftIdRef.current++)]);
    };

    const removeQuestion = (id) => {
        setQuestions((prev) => {
            if (prev.length === 1) return [createQuestionDraft(id)];
            return prev.filter((question) => question.id !== id);
        });
    };

    const updateQuestion = (id, field, value) => {
        setQuestions((prev) => prev.map((question) => (
            question.id === id ? { ...question, [field]: value } : question
        )));
    };

    const addOption = (questionId) => {
        setQuestions((prev) => prev.map((question) => {
            if (question.id === questionId) {
                return { ...question, options: [...question.options, { ...EMPTY_OPTION }] };
            }
            return question;
        }));
    };

    const removeOption = (questionId, optionIndex) => {
        setQuestions((prev) => prev.map((question) => {
            if (question.id === questionId) {
                return {
                    ...question,
                    options: question.options.filter((_, currentIndex) => currentIndex !== optionIndex),
                };
            }
            return question;
        }));
    };

    const updateOption = (questionId, optionIndex, field, value) => {
        setQuestions((prev) => prev.map((question) => {
            if (question.id !== questionId) {
                return question;
            }

            const nextOptions = [...question.options];
            nextOptions[optionIndex] = { ...nextOptions[optionIndex], [field]: value };

            if (field === 'isCorrect' && value && question.questionType === 'multiple_choice') {
                nextOptions.forEach((option, currentIndex) => {
                    if (currentIndex !== optionIndex) {
                        option.isCorrect = false;
                    }
                });
            }

            return { ...question, options: nextOptions };
        }));
    };

    const handleGenerateWithAI = async () => {
        const trimmedPrompt = aiPrompt.trim();
        const sourceText = trimmedPrompt || contextTitle.trim();

        if (!sourceText) {
            setFormError('Hãy nhập chủ đề hoặc dán nội dung bài học để AI tạo câu hỏi.');
            return;
        }

        setAiGenerating(true);
        setFormError('');

        try {
            const generatedQuestions = await geminiApi.generateQuizQuestions({
                sourceText,
                count: aiQuestionCount,
                contextTitle,
            });

            setQuestions((prev) => {
                let nextId = nextDraftIdRef.current;
                const shouldReplaceInitialBlank = prev.length === 1 && isQuestionDraftEmpty(prev[0]);
                const generatedDrafts = generatedQuestions.map((question, index) => {
                    const id = shouldReplaceInitialBlank && index === 0 ? prev[0].id : nextId++;
                    return createGeneratedQuestionDraft(id, question);
                });

                nextDraftIdRef.current = nextId;
                return shouldReplaceInitialBlank ? generatedDrafts : [...prev, ...generatedDrafts];
            });
        } catch (error) {
            setFormError(error?.message || 'AI chưa tạo được câu hỏi phù hợp. Bạn thử mô tả cụ thể hơn.');
        } finally {
            setAiGenerating(false);
        }
    };

    const buildPayload = () => {
        const validQuestions = [];

        for (const question of questions) {
            if (!question.questionText.trim()) continue;

            validQuestions.push({
                questionText: question.questionText.trim(),
                questionType: question.questionType,
                difficultyLevel: question.difficultyLevel,
                questionExplanation: question.questionExplanation.trim() || undefined,
                options: question.options
                    .filter((option) => option.optionText.trim())
                    .map((option, index) => ({
                        optionText: option.optionText.trim(),
                        isCorrect: option.isCorrect,
                        optionOrder: index,
                    })),
            });
        }

        if (validQuestions.length === 0) {
            setFormError('Vui lòng nhập ít nhất một câu hỏi hoàn chỉnh trước khi lưu.');
            return null;
        }

        for (let index = 0; index < validQuestions.length; index += 1) {
            const question = validQuestions[index];
            if (question.options.length < 2 && question.questionType === 'multiple_choice') {
                setFormError(`Câu hỏi ${index + 1} cần có ít nhất 2 đáp án.`);
                return null;
            }

            const hasCorrectOption = question.options.some((option) => option.isCorrect);
            if (!hasCorrectOption) {
                setFormError(`Câu hỏi ${index + 1} cần có ít nhất 1 đáp án đúng.`);
                return null;
            }
        }

        setFormError('');
        return validQuestions;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = buildPayload();
        if (!payload) return;
        await onSubmit(payload, { keepOpen: false });
    };

    const handleSubmitAndContinue = async () => {
        const payload = buildPayload();
        if (!payload) return;
        const saved = await onSubmit(payload, { keepOpen: true });
        if (saved) {
            resetForm();
        }
    };

    if (!open) return null;

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="modal-box max-w-5xl rounded-3xl border border-base-300 bg-base-100 shadow-2xl"
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="flex items-center gap-2 text-xl font-black">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                            <HelpCircle className="h-5 w-5 text-white" />
                        </div>
                        Thêm Câu hỏi
                    </h3>
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="btn btn-sm rounded-xl border-amber-200 bg-white font-bold text-amber-600 shadow-sm hover:bg-amber-50"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm khối câu hỏi
                    </button>
                </div>

                <div className="mb-5 rounded-3xl border border-amber-100 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-amber-700">
                                <Sparkles className="h-4 w-4" />
                                Tạo Bằng AI
                            </div>
                            <p className="max-w-2xl text-sm font-medium leading-6 text-base-content/65">
                                Dán nội dung bài học hoặc mô tả chủ đề, AI sẽ gợi ý câu hỏi, đáp án đúng và giải thích
                                để expert chỉnh lại trước khi lưu.
                            </p>
                            {contextTitle && (
                                <p className="text-xs font-bold text-base-content/45">
                                    Ngữ cảnh hiện tại: {contextTitle}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="rounded-2xl border border-amber-200 bg-white px-3 py-2 shadow-sm">
                                <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-amber-700">
                                    Số câu
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={8}
                                    value={aiQuestionCount}
                                    onChange={(event) => {
                                        const nextValue = Number(event.target.value);
                                        const safeValue = Number.isFinite(nextValue)
                                            ? Math.min(8, Math.max(1, Math.round(nextValue)))
                                            : DEFAULT_AI_QUESTION_COUNT;
                                        setAiQuestionCount(safeValue);
                                    }}
                                    className="mt-1 h-8 w-16 rounded-xl border border-amber-200 bg-amber-50/60 px-2 text-sm font-bold text-amber-700 focus:border-amber-400 focus:outline-none"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleGenerateWithAI}
                                disabled={loading || aiGenerating}
                                className="btn rounded-2xl border-none bg-gradient-to-r from-amber-500 to-orange-500 px-5 font-bold text-white shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 disabled:opacity-60"
                            >
                                {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                {aiGenerating ? 'Đang tạo...' : 'Tạo câu hỏi'}
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={aiPrompt}
                        onChange={(event) => setAiPrompt(event.target.value)}
                        placeholder="Ví dụ: Tạo bộ câu hỏi về vòng lặp for trong JavaScript cho người mới bắt đầu, nhấn mạnh cú pháp và lỗi thường gặp..."
                        className="textarea textarea-bordered mt-4 min-h-[120px] w-full rounded-2xl border-amber-100 bg-white/90 text-sm font-medium leading-6 resize-none focus:border-amber-300 focus:outline-none"
                        rows={4}
                    />
                </div>

                {formError && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                        {formError}
                    </div>
                )}

                <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                    {questions.map((question, questionIndex) => (
                        <div key={question.id} className="relative rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between border-b border-base-200 pb-3">
                                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                                    <HelpCircle className="h-3.5 w-3.5" />
                                    Câu hỏi {questionIndex + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(question.id)}
                                    className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-red-500"
                                    title="Xóa câu hỏi này"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-bold uppercase tracking-wider text-base-content/70">
                                                Nội dung câu hỏi <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        <textarea
                                            value={question.questionText}
                                            onChange={(event) => updateQuestion(question.id, 'questionText', event.target.value)}
                                            placeholder="VD: Đâu là kết quả đúng của phép tính 2+2?"
                                            className="textarea textarea-bordered min-h-[100px] resize-none rounded-2xl bg-base-50 text-sm font-medium focus:border-amber-400 focus:outline-none"
                                            rows={3}
                                            required={questions.length === 1}
                                            autoFocus={questionIndex === 0}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="form-control flex-1">
                                            <label className="label py-1">
                                                <span className="label-text text-xs font-bold uppercase tracking-wider text-base-content/70">
                                                    Loại câu hỏi
                                                </span>
                                            </label>
                                            <select
                                                value={question.questionType}
                                                onChange={(event) => updateQuestion(question.id, 'questionType', event.target.value)}
                                                className="select select-bordered select-sm rounded-xl bg-base-50 font-medium"
                                            >
                                                <option value="multiple_choice">Trắc nghiệm</option>
                                                <option value="true_false">Đúng/Sai</option>
                                                <option value="fill_blank">Điền từ</option>
                                            </select>
                                        </div>

                                        <div className="form-control flex-1">
                                            <label className="label py-1">
                                                <span className="label-text text-xs font-bold uppercase tracking-wider text-base-content/70">
                                                    Độ khó
                                                </span>
                                            </label>
                                            <select
                                                value={question.difficultyLevel}
                                                onChange={(event) => updateQuestion(question.id, 'difficultyLevel', event.target.value)}
                                                className="select select-bordered select-sm rounded-xl bg-base-50 font-medium"
                                            >
                                                <option value="easy">Dễ</option>
                                                <option value="medium">Trung bình</option>
                                                <option value="hard">Khó</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-bold uppercase tracking-wider text-base-content/70">
                                                Giải thích (tùy chọn)
                                            </span>
                                        </label>
                                        <textarea
                                            value={question.questionExplanation}
                                            onChange={(event) => updateQuestion(question.id, 'questionExplanation', event.target.value)}
                                            placeholder="Giải thích đáp án đúng..."
                                            className="textarea textarea-bordered rounded-2xl bg-base-50 text-sm font-medium text-base-content/80 resize-none focus:border-amber-400 focus:outline-none"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-bold uppercase tracking-wider text-base-content/70">
                                                Các đáp án
                                            </span>
                                        </label>
                                        <div className="mt-1 space-y-2">
                                            {question.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateOption(question.id, optionIndex, 'isCorrect', !option.isCorrect)}
                                                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-all ${option.isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-base-300 bg-white hover:border-emerald-400'}`}
                                                        title={option.isCorrect ? 'Đáp án đúng' : 'Đánh dấu đúng'}
                                                    >
                                                        {option.isCorrect && <CheckCircle2 className="h-4 w-4" />}
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={option.optionText}
                                                        onChange={(event) => updateOption(question.id, optionIndex, 'optionText', event.target.value)}
                                                        placeholder={`Đáp án ${String.fromCharCode(65 + optionIndex)}`}
                                                        className="input input-bordered input-sm h-10 flex-1 rounded-xl bg-white font-medium focus:border-amber-400 focus:outline-none"
                                                    />
                                                    {question.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(question.id, optionIndex)}
                                                            className="btn btn-ghost btn-sm btn-circle text-red-400 hover:bg-red-50"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {question.options.length < 6 && (
                                            <button
                                                type="button"
                                                onClick={() => addOption(question.id)}
                                                className="btn btn-sm btn-ghost mt-2 gap-1.5 rounded-xl bg-amber-50 font-bold text-amber-600 hover:bg-amber-100"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Thêm đáp án
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-action mt-6 border-t border-base-200 pt-4">
                    <button type="button" onClick={onClose} className="btn btn-ghost rounded-xl px-6 font-bold">
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmitAndContinue}
                        disabled={loading || aiGenerating}
                        className="btn rounded-xl border-amber-200 bg-white px-6 font-bold text-amber-600 shadow-sm hover:bg-amber-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Lưu và thêm tiếp
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || aiGenerating}
                        className="btn rounded-xl border-none bg-gradient-to-r from-amber-500 to-orange-500 px-6 font-bold text-white shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Lưu câu hỏi
                    </button>
                </div>
            </motion.div>
            <div className="modal-backdrop bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
        </div>
    );
}
