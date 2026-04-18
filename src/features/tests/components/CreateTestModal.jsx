import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';
import { OwlDialog, useOwlDialog } from '@/shared/ui/common';
import { aiGeminiApi, quizApi } from '@/shared/api';
import { savePracticeDraft } from '@/features/tests/utils/practiceDraftCache';
import { buildManualQuestionFromSource, extractPracticeManualQuestions } from '@/features/tests/utils/practiceQuestionDraft';

import ManualQuestionEditor, { createEmptyManualQuestion, normalizeManualQuestionsPayload } from './ManualQuestionEditor';

const QUESTION_SOURCE_MODE = { manual: 'manual', ai: 'ai' };
const MAX_AI_QUESTIONS = 10;
const DAILY_AI_REQUEST_LIMIT = 2;
const AI_USAGE_STORAGE_KEY = 'skr-test-ai-usage';

function readAiUsageMap() {
    if (typeof window === 'undefined') return {};
    try {
        const parsed = JSON.parse(localStorage.getItem(AI_USAGE_STORAGE_KEY) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeAiUsageMap(value) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AI_USAGE_STORAGE_KEY, JSON.stringify(value));
}

function getAiUsageKey(userId) {
    const now = new Date();
    return `${userId || 'anonymous'}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getAiUsageCount(userId) {
    return Number(readAiUsageMap()[getAiUsageKey(userId)] || 0);
}

function incrementAiUsageCount(userId) {
    const usageMap = readAiUsageMap();
    const key = getAiUsageKey(userId);
    usageMap[key] = Number(usageMap[key] || 0) + 1;
    writeAiUsageMap(usageMap);
    return usageMap[key];
}

function formatRuleList(items) {
    return items.map((item) => `- ${item}`).join('\n');
}

function extractErrorDetails(error, fallbackMessage) {
    const responseData = error?.response?.data;
    const violations = Array.isArray(responseData?.violations)
        ? responseData.violations
        : Array.isArray(responseData?.errors)
            ? responseData.errors
            : [];

    const details = violations
        .map((item) => (typeof item === 'string' ? item : item?.message || item?.error || item?.reason || ''))
        .map((item) => String(item || '').trim())
        .filter(Boolean);

    return {
        message: String(responseData?.message || responseData?.error || error?.message || fallbackMessage).trim() || fallbackMessage,
        details: details.length > 0 ? formatRuleList(details) : '',
    };
}

function buildAiSourceText({ formData, selectedSubject, currentUserId }) {
    return [
        selectedSubject?.label ? `Môn học learner đã chọn: ${selectedSubject.label}` : '',
        formData.testTitle.trim() ? `Tên bài thi: ${formData.testTitle.trim()}` : '',
        formData.testDescription.trim() ? `Mô tả bài thi: ${formData.testDescription.trim()}` : '',
        currentUserId ? `User ID sở hữu nội dung: ${currentUserId}` : '',
        'Chỉ tạo câu hỏi trong phạm vi môn học đã chọn, không mở rộng sang môn khác.',
    ].filter(Boolean).join('\n');
}

function resolveSelectedSubjectId(initialTest) {
    return String(
        initialTest?.subjectId
        || initialTest?.courseId
        || initialTest?.course?.subjectId
        || initialTest?.course?.courseId
        || '',
    ).trim();
}

function extractInitialQuestions(initialTest) {
    const mapped = extractPracticeManualQuestions(initialTest);
    return mapped.length > 0 ? mapped : [createEmptyManualQuestion(1)];
}

function resolvePracticeTestIdFromResponse(response, fallbackId = '') {
    const payload = response?.data?.data || response?.data || response || {};
    const nestedDetail = payload?.practice || payload?.item || payload?.data || {};

    return String(
        nestedDetail?.practiceTestId
        || payload?.practiceTestId
        || payload?.id
        || fallbackId
        || '',
    ).trim();
}

export default function CreateTestModal({
    isOpen,
    onClose,
    onCreate,
    onUpdate,
    subjects = [],
    currentUserId = '',
    mode = 'create',
    initialTest = null,
}) {
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();
    const isEditMode = mode === 'edit';
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
    const [questionSourceMode, setQuestionSourceMode] = useState(QUESTION_SOURCE_MODE.manual);
    const [manualQuestions, setManualQuestions] = useState([createEmptyManualQuestion(1)]);
    const [aiQuestionCount, setAiQuestionCount] = useState(5);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [creating, setCreating] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const subjectOptions = Array.isArray(subjects) ? subjects : [];
    const selectedSubject = subjectOptions.find((option) => String(option.value) === String(selectedSubjectId));
    const aiUsageCount = useMemo(() => getAiUsageCount(currentUserId), [currentUserId, aiGenerating]);
    const aiUsageRemaining = Math.max(DAILY_AI_REQUEST_LIMIT - aiUsageCount, 0);
    const modalTitle = isEditMode ? 'Cập nhật nội dung thi' : 'Tạo Bài Thi Mới';
    const modalDescription = isEditMode
        ? 'Chỉnh sửa toàn bộ nội dung hiện có của bài thi thử rồi lưu lại thay đổi.'
        : 'Cấu hình bài thi và thêm nội dung câu hỏi';
    const submitButtonLabel = creating
        ? (isEditMode ? 'Đang cập nhật...' : 'Đang tạo...')
        : (isEditMode ? 'Cập nhật nội dung thi' : 'Tạo bài thi');

    const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
    const toggleQuestionType = (type) => setFormData((prev) => ({
        ...prev,
        questionTypes: prev.questionTypes.includes(type)
            ? prev.questionTypes.filter((item) => item !== type)
            : [...prev.questionTypes, type],
    }));
    const setDifficulty = (key) => setFormData((prev) => ({
        ...prev,
        difficultyLevels: prev.difficultyLevels.includes(key)
            ? prev.difficultyLevels.filter((item) => item !== key)
            : [...prev.difficultyLevels, key],
    }));

    useEffect(() => {
        if (!isOpen) return;

        if (!isEditMode || !initialTest) {
            setFormData({
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
            setQuestionSourceMode(QUESTION_SOURCE_MODE.manual);
            setManualQuestions([createEmptyManualQuestion(1)]);
            setAiQuestionCount(5);
            setSelectedSubjectId('');
            setSubmitError('');
            return;
        }

        const nextQuestions = extractInitialQuestions(initialTest);
        const nextQuestionTypes = Array.from(new Set(nextQuestions.map((question) => question.questionType || 'multiple_choice')));

        setFormData({
            testTitle: String(initialTest?.testTitle || '').trim(),
            testDescription: String(initialTest?.testDescription || '').trim(),
            difficultyLevels: Array.isArray(initialTest?.difficultyLevels) && initialTest.difficultyLevels.length > 0
                ? initialTest.difficultyLevels
                : ['medium'],
            totalQuestions: Number(initialTest?.totalQuestions) || nextQuestions.length || 20,
            timeLimitMinutes: Number(initialTest?.timeLimitMinutes) || 30,
            questionTypes: nextQuestionTypes.length > 0 ? nextQuestionTypes : ['multiple_choice'],
            randomizeQuestions: initialTest?.randomizeQuestions !== false,
            randomizeOptions: initialTest?.randomizeOptions !== false,
            showCorrectAnswers: initialTest?.showCorrectAnswers !== false,
        });
        setQuestionSourceMode(QUESTION_SOURCE_MODE.manual);
        setManualQuestions(nextQuestions);
        setAiQuestionCount(Math.min(nextQuestions.length || 5, MAX_AI_QUESTIONS));
        setSelectedSubjectId(resolveSelectedSubjectId(initialTest));
        setSubmitError('');
    }, [initialTest, isEditMode, isOpen]);

    const convertGeneratedQuestionsToEditorState = (questions) => questions.map((question, index) => buildManualQuestionFromSource(question, index));

    const handleGenerateFromAI = async () => {
        const violations = [];
        if (!currentUserId) violations.push('Bạn chưa đăng nhập learner hợp lệ.');
        if (!selectedSubjectId) violations.push('Bạn chưa chọn môn học để AI tạo nội dung.');
        if (selectedSubjectId && !selectedSubject?.courseId) violations.push('Môn học đã chọn không nằm trong danh sách môn learner đã mua.');
        if (selectedSubject?.isOwnedByUser === false) violations.push('Môn học đã chọn không thuộc quyền sở hữu của user hiện tại.');
        if ((Number(aiQuestionCount) || 0) < 1 || Number(aiQuestionCount) > MAX_AI_QUESTIONS) violations.push(`Mỗi lần AI chỉ được tạo từ 1 đến ${MAX_AI_QUESTIONS} câu.`);
        if (aiUsageRemaining <= 0) violations.push(`Bạn đã dùng hết ${DAILY_AI_REQUEST_LIMIT} lượt yêu cầu AI trong hôm nay.`);

        if (violations.length > 0) {
            setSubmitError('Yêu cầu AI chưa hợp lệ. Vui lòng xem chi tiết trong thông báo của Con cú.');
            openDialog({ variant: 'error', title: 'Con cú chưa thể tạo câu hỏi', message: 'Yêu cầu này đang vi phạm một hoặc nhiều quy tắc của learner.', details: formatRuleList(violations), confirmLabel: 'Đã hiểu' });
            return;
        }

        try {
            setAiGenerating(true);
            setSubmitError('');
            incrementAiUsageCount(currentUserId);
            const generatedQuestions = await aiGeminiApi.generateQuestions({
                content: buildAiSourceText({ formData, selectedSubject, currentUserId }),
                questionCount: Math.min(Number(aiQuestionCount) || 5, MAX_AI_QUESTIONS),
                difficulty: formData.difficultyLevels[0] || 'medium',
                language: 'vi',
            });
            const finalQuestions = generatedQuestions.slice(0, MAX_AI_QUESTIONS);
            setManualQuestions(convertGeneratedQuestionsToEditorState(finalQuestions));
            setQuestionSourceMode(QUESTION_SOURCE_MODE.ai);
            openDialog({
                variant: 'success',
                title: 'Con cú đã tạo xong bộ câu hỏi',
                message: `AI vừa tạo ${finalQuestions.length} câu cho môn ${selectedSubject?.label || 'đã chọn'}.`,
                details: `Số lượt AI còn lại hôm nay: ${Math.max(DAILY_AI_REQUEST_LIMIT - getAiUsageCount(currentUserId), 0)}.\nBạn có thể chỉnh lại từng câu trước khi lưu bài thi.`,
                confirmLabel: 'Tuyệt vời',
                confirmTone: 'success',
            });
        } catch (error) {
            const resolvedError = extractErrorDetails(error, 'Không thể tạo câu hỏi bằng AI lúc này.');
            setSubmitError(resolvedError.message);
            openDialog({
                variant: 'error',
                title: 'Con cú gặp trục trặc',
                message: resolvedError.message,
                details: resolvedError.details || `- Rule hiện tại: tối đa ${MAX_AI_QUESTIONS} câu mỗi lần\n- Tối đa ${DAILY_AI_REQUEST_LIMIT} lượt AI mỗi ngày\n- Chỉ được tạo theo môn learner đã mua và thuộc user hiện tại`,
                confirmLabel: 'Đã hiểu',
            });
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
        }

        const normalizedManualQuestions = normalizeManualQuestionsPayload(manualQuestions);
        if (normalizedManualQuestions.error) {
            return { error: isEditMode ? 'Hãy kiểm tra lại nội dung câu hỏi trước khi cập nhật bài thi.' : 'Hãy bấm tạo câu hỏi bằng AI trước khi lưu bài thi.' };
        }

        return {
            ...basePayload,
            courseId: selectedSubject?.courseId || null,
            subjectId: selectedSubject?.value || null,
            subjectName: selectedSubject?.label || '',
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

            if (isEditMode && initialTest?.practiceTestId) {
                const updateResponse = await quizApi.updatePractice(initialTest.practiceTestId, payload);
                const resolvedPracticeTestId = resolvePracticeTestIdFromResponse(updateResponse, initialTest.practiceTestId);
                savePracticeDraft({
                    practiceTestId: resolvedPracticeTestId,
                    testTitle: formData.testTitle.trim(),
                    testDescription: formData.testDescription.trim(),
                    courseId: selectedSubject?.courseId || initialTest?.courseId || null,
                    subjectId: selectedSubject?.value || initialTest?.subjectId || null,
                    subjectName: selectedSubject?.label || initialTest?.subjectName || '',
                    timeLimitMinutes: formData.timeLimitMinutes,
                    randomizeQuestions: formData.randomizeQuestions,
                    randomizeOptions: formData.randomizeOptions,
                    showCorrectAnswers: formData.showCorrectAnswers,
                    difficultyLevels: formData.difficultyLevels,
                    questionTypes: formData.questionTypes,
                    totalQuestions: payload.totalQuestions,
                    manualQuestions: payload.manualQuestions,
                });
                await onUpdate?.({
                    practiceTestId: resolvedPracticeTestId,
                    testTitle: formData.testTitle.trim(),
                    details: `Đã cập nhật ${payload.totalQuestions} câu hỏi cho bài thi thử này.`,
                });
                onClose?.();
                return;
            }

            const createResponse = await quizApi.createPractice(payload);
            const resolvedPracticeTestId = resolvePracticeTestIdFromResponse(createResponse);
            savePracticeDraft({
                practiceTestId: resolvedPracticeTestId || null,
                testTitle: formData.testTitle.trim(),
                testDescription: formData.testDescription.trim(),
                courseId: selectedSubject?.courseId || null,
                subjectId: selectedSubject?.value || null,
                subjectName: selectedSubject?.label || '',
                timeLimitMinutes: formData.timeLimitMinutes,
                randomizeQuestions: formData.randomizeQuestions,
                randomizeOptions: formData.randomizeOptions,
                showCorrectAnswers: formData.showCorrectAnswers,
                difficultyLevels: formData.difficultyLevels,
                questionTypes: formData.questionTypes,
                totalQuestions: payload.totalQuestions,
                manualQuestions: payload.manualQuestions,
            });
            await onCreate?.({
                practiceTestId: resolvedPracticeTestId,
                testTitle: formData.testTitle.trim(),
                details: questionSourceMode === QUESTION_SOURCE_MODE.ai
                    ? `Môn học: ${selectedSubject?.label || 'đã chọn'}.\nSố câu AI: ${payload.totalQuestions}.`
                    : 'Nguồn câu hỏi: Nhập trực tiếp.',
            });
            onClose?.();
        } catch (error) {
            const resolvedError = extractErrorDetails(error, isEditMode ? 'Không thể cập nhật bài thi. Vui lòng thử lại.' : 'Không thể tạo bài thi. Vui lòng thử lại.');
            setSubmitError(resolvedError.message);
            openDialog({
                variant: 'error',
                title: isEditMode ? 'Con cú chưa thể cập nhật nội dung thi' : 'Con cú chưa thể lưu bài thi',
                message: resolvedError.message,
                details: resolvedError.details || 'Kiểm tra lại dữ liệu bài thi, quyền truy cập môn học hoặc thử lại sau ít phút.',
                confirmLabel: 'Đóng',
                confirmTone: 'danger',
            });
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }} className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-5xl relative z-10 max-h-[90vh] overflow-y-auto">
                <div className="p-6 pb-4 border-b border-base-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center"><Icon name="FilePlus2" size="md" className="text-white" /></div>
                            <div>
                                <h3 className="text-lg font-black text-base-content">{modalTitle}</h3>
                                <p className="text-xs text-base-content/60">{modalDescription}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm"><Icon name="X" size="md" /></button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control md:col-span-2">
                            <label className="label"><span className="label-text font-bold text-sm">Tên bài thi <span className="text-red-500">*</span></span></label>
                            <input type="text" placeholder="VD: Toán Cao Cấp - Đạo Hàm" className="input input-bordered w-full rounded-xl focus:border-blue-500" value={formData.testTitle} onChange={(event) => handleChange('testTitle', event.target.value)} />
                        </div>
                        <div className="form-control md:col-span-2">
                            <label className="label"><span className="label-text font-bold text-sm">Mô tả</span></label>
                            <textarea placeholder="Mô tả ngắn gọn về nội dung bài thi..." className="textarea textarea-bordered w-full rounded-xl focus:border-blue-500 resize-none" rows={2} value={formData.testDescription} onChange={(event) => handleChange('testDescription', event.target.value)} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold text-sm">Thời gian (phút)</span></label>
                            <input type="number" min={5} max={180} className="input input-bordered w-full rounded-xl focus:border-blue-500" value={formData.timeLimitMinutes} onChange={(event) => handleChange('timeLimitMinutes', parseInt(event.target.value, 10) || 30)} />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-bold text-sm">Nguồn câu hỏi</span></label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button type="button" onClick={() => setQuestionSourceMode(QUESTION_SOURCE_MODE.manual)} className={`rounded-2xl border p-4 text-left transition-all ${questionSourceMode === QUESTION_SOURCE_MODE.manual ? 'border-blue-500 bg-blue-500/8 shadow-lg shadow-blue-500/10' : 'border-base-300 hover:border-blue-500/30 hover:bg-base-200/40'}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${questionSourceMode === QUESTION_SOURCE_MODE.manual ? 'bg-blue-500 text-white' : 'bg-base-200 text-base-content/65'}`}><Icon name="FileText" size="md" /></div>
                                    <div>
                                        <p className="font-black text-sm text-base-content">Nhập trực tiếp</p>
                                        <p className="text-xs leading-5 text-base-content/60">Tự thêm nội dung câu hỏi để tạo dạng đề bạn muốn.</p>
                                    </div>
                                </div>
                            </button>
                            <button type="button" onClick={() => setQuestionSourceMode(QUESTION_SOURCE_MODE.ai)} className={`rounded-2xl border p-4 text-left transition-all ${questionSourceMode === QUESTION_SOURCE_MODE.ai ? 'border-blue-500 bg-blue-500/8 shadow-lg shadow-blue-500/10' : 'border-base-300 hover:border-blue-500/30 hover:bg-base-200/40'}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${questionSourceMode === QUESTION_SOURCE_MODE.ai ? 'bg-blue-500 text-white' : 'bg-base-200 text-base-content/65'}`}><Icon name="Sparkles" size="md" /></div>
                                    <div>
                                        <p className="font-black text-sm text-base-content">Tạo từ AI</p>
                                        <p className="text-xs leading-5 text-base-content/60">Chỉ tạo được nội dung theo môn learner đã mua và thuộc quyền user hiện tại.</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {questionSourceMode === QUESTION_SOURCE_MODE.manual && <ManualQuestionEditor questions={manualQuestions} onChange={setManualQuestions} />}

                    {questionSourceMode === QUESTION_SOURCE_MODE.ai && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 flex items-center justify-center shrink-0"><Icon name="Sparkles" size="md" /></div>
                                <div>
                                    <p className="text-[15px] font-black text-base-content tracking-tight">Con cú tạo câu hỏi cho learner</p>
                                    <p className="text-xs leading-relaxed text-base-content/60 mt-0.5 max-w-2xl">Cú AI sẽ tạo bộ câu hỏi trắc nghiệm theo đúng môn học bạn chọn để bạn thêm ngay vào đề thi.</p>
                                </div>
                            </div>
                            <div className="rounded-[24px] border border-violet-100 bg-white/40 p-1.5 shadow-sm">
                                <div className="rounded-[18px] bg-gradient-to-br from-violet-50/90 via-white to-blue-50/40 p-5 shadow-inner border border-white/60">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                        <div className="flex-1 w-full">
                                            <label className="label py-1 px-1"><span className="label-text font-black text-[11px] uppercase tracking-wider text-violet-800/60">Tạo từ môn học</span></label>
                                            <select className="select select-bordered w-full rounded-2xl bg-white shadow-sm border-violet-100 focus:border-violet-400 font-bold text-base-content transition-all" value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)}>
                                                <option value="">-- Chọn môn bạn đã mua --</option>
                                                {subjectOptions.map((subject) => (
                                                    <option key={subject.value} value={subject.value}>{subject.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-end gap-3 w-full lg:w-auto">
                                            <div className="flex-1 lg:flex-none rounded-2xl border border-violet-200 bg-white px-4 py-2 shadow-sm transition-all focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-400/20">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-violet-700/60 mb-0.5">Số câu</label>
                                                <input type="number" min={1} max={MAX_AI_QUESTIONS} className="h-8 w-full lg:w-16 rounded-xl bg-transparent px-1 text-lg font-black text-violet-700 focus:outline-none" value={aiQuestionCount} onChange={(event) => setAiQuestionCount(Math.max(1, Math.min(MAX_AI_QUESTIONS, parseInt(event.target.value, 10) || 1)))} />
                                            </div>
                                            <button type="button" onClick={handleGenerateFromAI} disabled={aiGenerating || creating || aiUsageRemaining <= 0} className="btn h-auto py-[14px] px-6 rounded-2xl border-none bg-gradient-to-r from-violet-600 to-blue-600 font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none flex-1 lg:flex-none">
                                                {aiGenerating ? <span className="loading loading-spinner loading-sm" /> : <Icon name="Sparkles" size="sm" />}
                                                {aiGenerating ? 'Đang tạo...' : 'Lệnh cho Cú'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100/50">
                                <div className="mt-0.5 rounded-full bg-indigo-100 p-1.5 text-indigo-500 shrink-0"><Icon name="Info" size="sm" /></div>
                                <div className="text-xs text-indigo-900/80 space-y-1.5 leading-relaxed">
                                    <p className="font-bold text-indigo-900 text-sm">Quy tắc tạo câu hỏi bằng AI</p>
                                    <p>Bạn còn <span className="font-black text-indigo-600 text-sm px-1">{aiUsageRemaining}</span> lượt yêu cầu AI trong hôm nay.</p>
                                    <ul className="list-disc list-inside space-y-0.5 ml-1 marker:text-indigo-400">
                                        <li>Mỗi lần tạo được tối đa {MAX_AI_QUESTIONS} câu hỏi.</li>
                                        <li>Chỉ hỗ trợ tạo câu hỏi theo môn học bạn đã sở hữu.</li>
                                    </ul>
                                </div>
                            </div>
                            <ManualQuestionEditor questions={manualQuestions} onChange={setManualQuestions} />
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="label"><span className="label-text font-bold text-sm">Tùy chọn</span></label>
                        {[
                            { key: 'randomizeQuestions', label: 'Trộn thứ tự câu hỏi', icon: 'Shuffle' },
                            { key: 'randomizeOptions', label: 'Trộn thứ tự đáp án', icon: 'ArrowLeftRight' },
                            { key: 'showCorrectAnswers', label: 'Hiện đáp án đúng sau khi nộp', icon: 'Eye' },
                        ].map((option) => (
                            <label key={option.key} className="flex items-center gap-3 p-3 bg-base-200/50 rounded-xl cursor-pointer hover:bg-base-200 transition-colors">
                                <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={formData[option.key]} onChange={(event) => handleChange(option.key, event.target.checked)} />
                                <Icon name={option.icon} size="sm" className="text-base-content/60" />
                                <span className="text-sm font-medium">{option.label}</span>
                            </label>
                        ))}
                    </div>

                    {submitError && <div className="rounded-2xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm font-medium">{submitError}</div>}
                </div>

                <div className="p-6 pt-4 border-t border-base-300 flex items-center justify-between gap-3">
                    <div className="text-xs text-base-content/45">
                        {questionSourceMode === QUESTION_SOURCE_MODE.manual
                            ? `Sẽ gửi ${manualQuestions.length} khối câu hỏi qua manualQuestions.`
                            : `Sẽ gửi ${manualQuestions.length} câu hỏi AI qua manualQuestions.`}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} disabled={creating} className="btn btn-ghost rounded-xl font-bold">Hủy</button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={!formData.testTitle.trim() || creating || aiGenerating} className="btn bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-none rounded-xl font-bold shadow-lg shadow-blue-600/20 gap-2 disabled:opacity-50">
                            {creating ? <span className="loading loading-spinner loading-sm" /> : <Icon name={isEditMode ? 'Save' : 'Plus'} size="md" />}
                            {submitButtonLabel}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <OwlDialog isOpen={dialog.isOpen} variant={dialog.variant} title={dialog.title} message={dialog.message} details={dialog.details} confirmLabel={dialog.confirmLabel} cancelLabel={dialog.cancelLabel} showCancel={dialog.showCancel} confirmTone={dialog.confirmTone} loading={dialog.loading} onConfirm={handleDialogConfirm} onClose={closeDialog} />
        </motion.div>
    );
}
