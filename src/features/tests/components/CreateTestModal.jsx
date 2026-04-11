import { useState } from 'react';
import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';
import { DIFFICULTY_CONFIG, QUESTION_TYPE_CONFIG } from './utils';
import quizApi from '@/shared/api/quizApi';
import { aiGeminiApi } from '@/shared/api';
import ManualQuestionEditor, { createEmptyManualQuestion, normalizeManualQuestionsPayload } from './ManualQuestionEditor';

const QUESTION_SOURCE_MODE = {
    bank: 'bank',
    manual: 'manual',
    ai: 'ai',
};

export default function CreateTestModal({ isOpen, onClose, onCreate }) {
    const [formData, setFormData] = useState({
        testTitle: '',
        testDescription: '',
        difficultyLevels: ['medium'],
        totalQuestions: 20,
        timeLimitMinutes: 30,
        questionTypes: ['multiple_choice'],
        randomizeQuestions: true,
        randomizeOptions: true,
        showCorrectAnswers: true,
    });
    const [questionSourceMode, setQuestionSourceMode] = useState(QUESTION_SOURCE_MODE.bank);
    const [manualQuestions, setManualQuestions] = useState([createEmptyManualQuestion(1)]);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiQuestionCount, setAiQuestionCount] = useState(5);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [creating, setCreating] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleQuestionType = (type) => {
        setFormData((prev) => ({
            ...prev,
            questionTypes: prev.questionTypes.includes(type)
                ? prev.questionTypes.filter((item) => item !== type)
                : [...prev.questionTypes, type],
        }));
    };

    const setDifficulty = (key) => {
        setFormData((prev) => ({
            ...prev,
            difficultyLevels: prev.difficultyLevels.includes(key)
                ? prev.difficultyLevels.filter((item) => item !== key)
                : [...prev.difficultyLevels, key],
        }));
    };

    const convertGeneratedQuestionsToEditorState = (questions) => questions.map((question, index) => {
        const normalizedType = question.questionType === 'true_false' ? 'true_false' : 'multiple_choice';
        const normalizedOptions = Array.isArray(question.options) ? question.options : [];
        const trueFalseAnswer = normalizedType === 'true_false'
            ? (normalizedOptions.find((option) => option.isCorrect)?.optionText === 'Sai' ? 'false' : 'true')
            : 'true';

        return {
            id: Date.now() + index,
            questionText: question.questionText || '',
            questionType: normalizedType,
            trueFalseAnswer,
            options: normalizedType === 'true_false'
                ? [
                    { optionText: 'Đúng', isCorrect: trueFalseAnswer === 'true' },
                    { optionText: 'Sai', isCorrect: trueFalseAnswer === 'false' },
                ]
                : normalizedOptions.map((option, optionIndex) => ({
                    optionText: String(option?.optionText || '').trim(),
                    isCorrect: optionIndex === (normalizedOptions.findIndex((item) => item.isCorrect) >= 0
                        ? normalizedOptions.findIndex((item) => item.isCorrect)
                        : 0),
                })),
        };
    });

    const handleGenerateFromAI = async () => {
        if (!aiPrompt.trim()) {
            setSubmitError('Hãy nhập chủ đề hoặc nội dung để AI tạo câu hỏi.');
            return;
        }

        try {
            setAiGenerating(true);
            setSubmitError('');
            const generatedQuestions = await aiGeminiApi.generateQuestions({
                content: aiPrompt.trim(),
                questionCount: aiQuestionCount,
                difficulty: formData.difficultyLevels[0] || 'medium',
                language: 'vi',
            });

            setManualQuestions(convertGeneratedQuestionsToEditorState(generatedQuestions));
        } catch (error) {
            setSubmitError(error?.message || 'Không thể tạo câu hỏi bằng AI lúc này.');
        } finally {
            setAiGenerating(false);
        }
    };

    const buildPayload = () => {
        const basePayload = {
            testTitle: formData.testTitle.trim(),
            testDescription: formData.testDescription.trim() || undefined,
            timeLimitMinutes: formData.timeLimitMinutes,
            randomizeQuestions: formData.randomizeQuestions,
            randomizeOptions: formData.randomizeOptions,
            showCorrectAnswers: formData.showCorrectAnswers,
        };

        if (questionSourceMode === QUESTION_SOURCE_MODE.bank) {
            return {
                ...basePayload,
                difficultyLevels: formData.difficultyLevels,
                totalQuestions: formData.totalQuestions,
                questionTypes: formData.questionTypes,
            };
        }

        if (questionSourceMode === QUESTION_SOURCE_MODE.manual) {
            const normalizedManualQuestions = normalizeManualQuestionsPayload(manualQuestions);
            if (normalizedManualQuestions.error) {
                return { error: normalizedManualQuestions.error };
            }

            return {
                ...basePayload,
                totalQuestions: normalizedManualQuestions.data.length,
                manualQuestions: normalizedManualQuestions.data,
            };
        }

        const normalizedManualQuestions = normalizeManualQuestionsPayload(manualQuestions);
        if (normalizedManualQuestions.error) {
            return { error: 'Hãy nhập chủ đề và tạo câu hỏi bằng AI trước khi lưu bài thi.' };
        }

        return {
            ...basePayload,
            totalQuestions: normalizedManualQuestions.data.length,
            manualQuestions: normalizedManualQuestions.data,
        };
    };

    const handleSubmit = async () => {
        if (!formData.testTitle.trim()) return;

        const payload = buildPayload();
        if (payload.error) {
            setSubmitError(payload.error);
            return;
        }

        try {
            setCreating(true);
            setSubmitError('');
            await quizApi.createPractice(payload);
            onCreate?.();
            onClose();
        } catch (error) {
            console.error('Error creating practice test:', error);
            setSubmitError(
                error?.response?.data?.message
                || error?.response?.data?.error
                || error?.message
                || 'Không thể tạo bài thi. Vui lòng thử lại.'
            );
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-5xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6 pb-4 border-b border-base-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
                                <Icon name="FilePlus2" size="md" className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-base-content">Tạo Bài Thi Mới</h3>
                                <p className="text-xs text-base-content/60">Cấu hình bài thi và thêm nội dung câu hỏi</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
                            <Icon name="X" size="md" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control md:col-span-2">
                            <label className="label">
                                <span className="label-text font-bold text-sm">Tên bài thi <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="text"
                                placeholder="VD: Toán Cao Cấp - Đạo Hàm"
                                className="input input-bordered w-full rounded-xl focus:border-blue-500"
                                value={formData.testTitle}
                                onChange={(event) => handleChange('testTitle', event.target.value)}
                            />
                        </div>

                        <div className="form-control md:col-span-2">
                            <label className="label">
                                <span className="label-text font-bold text-sm">Mô tả</span>
                            </label>
                            <textarea
                                placeholder="Mô tả ngắn gọn về nội dung bài thi..."
                                className="textarea textarea-bordered w-full rounded-xl focus:border-blue-500 resize-none"
                                rows={2}
                                value={formData.testDescription}
                                onChange={(event) => handleChange('testDescription', event.target.value)}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold text-sm">Thời gian (phút)</span>
                            </label>
                            <input
                                type="number"
                                min={5}
                                max={180}
                                className="input input-bordered w-full rounded-xl focus:border-blue-500"
                                value={formData.timeLimitMinutes}
                                onChange={(event) => handleChange('timeLimitMinutes', parseInt(event.target.value, 10) || 30)}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold text-sm">Nguồn câu hỏi</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setQuestionSourceMode(QUESTION_SOURCE_MODE.bank)}
                                className={`rounded-2xl border p-4 text-left transition-all ${questionSourceMode === QUESTION_SOURCE_MODE.bank
                                    ? 'border-blue-500 bg-blue-500/8 shadow-lg shadow-blue-500/10'
                                    : 'border-base-300 hover:border-blue-500/30 hover:bg-base-200/40'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${questionSourceMode === QUESTION_SOURCE_MODE.bank ? 'bg-blue-500 text-white' : 'bg-base-200 text-base-content/65'}`}>
                                        <Icon name="Layers3" size="md" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-base-content">Ngân hàng câu hỏi</p>
                                        <p className="text-xs leading-5 text-base-content/60">Tạo đề theo số lượng, độ khó và loại câu hỏi như luồng cũ.</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setQuestionSourceMode(QUESTION_SOURCE_MODE.manual)}
                                className={`rounded-2xl border p-4 text-left transition-all ${questionSourceMode === QUESTION_SOURCE_MODE.manual
                                    ? 'border-blue-500 bg-blue-500/8 shadow-lg shadow-blue-500/10'
                                    : 'border-base-300 hover:border-blue-500/30 hover:bg-base-200/40'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${questionSourceMode === QUESTION_SOURCE_MODE.manual ? 'bg-blue-500 text-white' : 'bg-base-200 text-base-content/65'}`}>
                                        <Icon name="FileText" size="md" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-base-content">Nhập trực tiếp</p>
                                        <p className="text-xs leading-5 text-base-content/60">Tự thêm nội dung câu hỏi để tạo đúng bộ đề bạn muốn.</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setQuestionSourceMode(QUESTION_SOURCE_MODE.ai)}
                                className={`rounded-2xl border p-4 text-left transition-all ${questionSourceMode === QUESTION_SOURCE_MODE.ai
                                    ? 'border-blue-500 bg-blue-500/8 shadow-lg shadow-blue-500/10'
                                    : 'border-base-300 hover:border-blue-500/30 hover:bg-base-200/40'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${questionSourceMode === QUESTION_SOURCE_MODE.ai ? 'bg-blue-500 text-white' : 'bg-base-200 text-base-content/65'}`}>
                                        <Icon name="Sparkles" size="md" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-base-content">Tạo từ AI</p>
                                        <p className="text-xs leading-5 text-base-content/60">Nhập chủ đề, số câu cần tạo rồi để AI sinh nội dung câu hỏi cho bạn.</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {questionSourceMode === QUESTION_SOURCE_MODE.bank && (
                        <>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold text-sm">Độ khó (chọn nhiều)</span>
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setDifficulty(key)}
                                            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 ${formData.difficultyLevels.includes(key)
                                                ? `${config.bg} ${config.color} border-current`
                                                : 'border-base-300 text-base-content/60 hover:border-base-content/20'
                                                }`}
                                        >
                                            {config.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-bold text-sm">Số câu hỏi</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        className="input input-bordered w-full rounded-xl focus:border-blue-500"
                                        value={formData.totalQuestions}
                                        onChange={(event) => handleChange('totalQuestions', parseInt(event.target.value, 10) || 20)}
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold text-sm">Loại câu hỏi</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(QUESTION_TYPE_CONFIG).map(([key, config]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => toggleQuestionType(key)}
                                            className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 ${formData.questionTypes.includes(key)
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                                                : 'border-base-300 text-base-content/60 hover:border-blue-500/30'
                                                }`}
                                        >
                                            <Icon name={config.icon} size="sm" className={formData.questionTypes.includes(key) ? config.color : ''} />
                                            {config.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {questionSourceMode === QUESTION_SOURCE_MODE.manual && (
                        <ManualQuestionEditor questions={manualQuestions} onChange={setManualQuestions} />
                    )}

                    {questionSourceMode === QUESTION_SOURCE_MODE.ai && (
                        <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/80 to-blue-50/70 p-5 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-500 text-white flex items-center justify-center">
                                    <Icon name="Sparkles" size="md" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-base-content">Tạo câu hỏi bằng AI</p>
                                    <p className="text-xs leading-5 text-base-content/60">
                                        Nhập chủ đề hoặc dán nội dung nguồn. AI sẽ sinh bộ câu hỏi theo số lượng bạn yêu cầu,
                                        sau đó bạn có thể chỉnh lại trước khi tạo bài thi.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-4 items-end">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-bold text-sm">Chủ đề / nội dung cho AI</span>
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered rounded-xl focus:border-violet-500 resize-none"
                                        rows={4}
                                        placeholder="VD: Tạo bộ câu hỏi JavaScript cơ bản cho người mới học, tập trung vào biến, hàm, scope và mảng."
                                        value={aiPrompt}
                                        onChange={(event) => setAiPrompt(event.target.value)}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-bold text-sm">Số câu AI tạo</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        className="input input-bordered rounded-xl focus:border-violet-500"
                                        value={aiQuestionCount}
                                        onChange={(event) => setAiQuestionCount(Math.max(1, Math.min(20, parseInt(event.target.value, 10) || 1)))}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGenerateFromAI}
                                    disabled={aiGenerating || creating}
                                    className="btn rounded-xl border-none bg-gradient-to-r from-violet-500 to-blue-500 text-white"
                                >
                                    {aiGenerating ? <span className="loading loading-spinner loading-sm" /> : <Icon name="Sparkles" size="sm" />}
                                    {aiGenerating ? 'Đang tạo...' : 'Tạo câu hỏi'}
                                </button>
                            </div>

                            <ManualQuestionEditor questions={manualQuestions} onChange={setManualQuestions} />
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="label">
                            <span className="label-text font-bold text-sm">Tùy chọn</span>
                        </label>
                        {[
                            { key: 'randomizeQuestions', label: 'Trộn thứ tự câu hỏi', icon: 'Shuffle' },
                            { key: 'randomizeOptions', label: 'Trộn thứ tự đáp án', icon: 'ArrowLeftRight' },
                            { key: 'showCorrectAnswers', label: 'Hiện đáp án đúng sau khi nộp', icon: 'Eye' },
                        ].map((option) => (
                            <label key={option.key} className="flex items-center gap-3 p-3 bg-base-200/50 rounded-xl cursor-pointer hover:bg-base-200 transition-colors">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-sm toggle-primary"
                                    checked={formData[option.key]}
                                    onChange={(event) => handleChange(option.key, event.target.checked)}
                                />
                                <Icon name={option.icon} size="sm" className="text-base-content/60" />
                                <span className="text-sm font-medium">{option.label}</span>
                            </label>
                        ))}
                    </div>

                    {submitError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm font-medium">
                            {submitError}
                        </div>
                    )}
                </div>

                <div className="p-6 pt-4 border-t border-base-300 flex items-center justify-between gap-3">
                    <div className="text-xs text-base-content/45">
                        {questionSourceMode === QUESTION_SOURCE_MODE.manual
                            ? `Sẽ gửi ${manualQuestions.length} khối câu hỏi qua manualQuestions.`
                            : questionSourceMode === QUESTION_SOURCE_MODE.ai
                                ? `Sẽ gửi ${manualQuestions.length} câu hỏi AI qua manualQuestions.`
                                : 'Sẽ tạo bài thi từ ngân hàng câu hỏi.'}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={onClose} disabled={creating} className="btn btn-ghost rounded-xl font-bold">
                            Hủy
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={!formData.testTitle.trim() || creating || aiGenerating}
                            className="btn bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-none rounded-xl font-bold shadow-lg shadow-blue-600/20 gap-2 disabled:opacity-50"
                        >
                            {creating ? <span className="loading loading-spinner loading-sm" /> : <Icon name="Plus" size="md" />}
                            {creating ? 'Đang tạo...' : 'Tạo bài thi'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
