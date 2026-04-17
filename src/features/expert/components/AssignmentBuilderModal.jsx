import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Sparkles, Trash2, Loader2, ClipboardCheck, WandSparkles } from 'lucide-react';
import { aiGeminiApi } from '@/shared/api';
import {
    createDefaultAssignmentDraft,
    normalizeAssignmentDetail,
    normalizeRubricCriteria,
} from '@/features/assignment/utils/assignmentModel';

function createCriterionDraft(index, maxPoints = 25) {
    return {
        criterionId: `criterion-${index}`,
        title: '',
        description: '',
        maxPoints,
    };
}

function buildInitialForm(initialValue) {
    const normalized = initialValue
        ? normalizeAssignmentDetail(initialValue)
        : createDefaultAssignmentDraft();

    return {
        title: normalized.title,
        description: normalized.description,
        instructions: normalized.instructions,
        submissionFormat: normalized.submissionFormat,
        maxScore: normalized.maxScore,
        reviewFocus: normalized.reviewFocus || '',
        sourceType: normalized.sourceType || 'manual',
        rubricCriteria: normalized.rubricCriteria.length > 0
            ? normalized.rubricCriteria
            : normalizeRubricCriteria([], normalized.maxScore),
    };
}

export default function AssignmentBuilderModal({
    open,
    onClose,
    onSave,
    loading = false,
    contextTitle = '',
    initialValue = null,
}) {
    const initialForm = useMemo(() => buildInitialForm(initialValue), [initialValue]);
    const [form, setForm] = useState(initialForm);
    const [submitError, setSubmitError] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiCriteriaCount, setAiCriteriaCount] = useState(4);
    const [aiGenerating, setAiGenerating] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        setForm(initialForm);
        setSubmitError('');
        setAiPrompt('');
        setAiCriteriaCount(Math.max(2, Math.min(6, initialForm.rubricCriteria.length || 4)));
    }, [initialForm, open]);

    if (!open) {
        return null;
    }

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setSubmitError('');
    };

    const updateCriterion = (criterionId, field, value) => {
        setForm((prev) => ({
            ...prev,
            rubricCriteria: prev.rubricCriteria.map((criterion) => (
                criterion.criterionId === criterionId
                    ? { ...criterion, [field]: field === 'maxPoints' ? Math.max(0, Number(value) || 0) : value }
                    : criterion
            )),
        }));
        setSubmitError('');
    };

    const handleAddCriterion = () => {
        setForm((prev) => ({
            ...prev,
            rubricCriteria: [
                ...prev.rubricCriteria,
                createCriterionDraft(prev.rubricCriteria.length + 1, Math.max(5, Math.round((prev.maxScore || 100) / 4))),
            ],
        }));
    };

    const handleRemoveCriterion = (criterionId) => {
        setForm((prev) => ({
            ...prev,
            rubricCriteria: prev.rubricCriteria.filter((criterion) => criterion.criterionId !== criterionId),
        }));
    };

    const handleGenerateWithAI = async () => {
        if (!aiPrompt.trim()) {
            setSubmitError('Hãy nhập chủ đề hoặc mô tả ngắn để AI tạo assignment.');
            return;
        }

        try {
            setAiGenerating(true);
            setSubmitError('');
            const generated = await aiGeminiApi.generateAssignment({
                topic: aiPrompt.trim(),
                criteriaCount: aiCriteriaCount,
                contextTitle,
                language: 'vi',
            });

            setForm((prev) => ({
                ...prev,
                ...buildInitialForm({ ...generated, sourceType: 'ai' }),
                sourceType: 'ai',
            }));
        } catch (error) {
            setSubmitError(error?.message || 'Không thể tạo assignment bằng AI lúc này.');
        } finally {
            setAiGenerating(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            ...form,
            title: String(form.title || '').trim(),
            description: String(form.description || '').trim(),
            instructions: String(form.instructions || '').trim(),
            submissionFormat: String(form.submissionFormat || '').trim(),
            reviewFocus: String(form.reviewFocus || '').trim(),
            maxScore: Math.max(1, Number(form.maxScore) || 100),
            rubricCriteria: form.rubricCriteria
                .map((criterion) => ({
                    ...criterion,
                    title: String(criterion.title || '').trim(),
                    description: String(criterion.description || '').trim(),
                    maxPoints: Math.max(0, Number(criterion.maxPoints) || 0),
                }))
                .filter((criterion) => criterion.title),
        };

        if (!payload.title || !payload.description) {
            setSubmitError('Cần có tên assignment và đề bài để lưu.');
            return;
        }

        if (payload.rubricCriteria.length === 0) {
            setSubmitError('Cần ít nhất 1 tiêu chí chấm điểm.');
            return;
        }

        await onSave?.(payload);
    };

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 120 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-box max-w-5xl rounded-3xl border border-base-300 bg-base-100 p-0 shadow-2xl"
            >
                <div className="border-b border-base-300 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
                                <ClipboardCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-base-content">Thiết kế assignment</h3>
                                <p className="mt-1 text-xs font-medium text-base-content/55">
                                    {contextTitle || 'Nhập đề bài, hướng dẫn nộp bài và rubric chấm điểm cho học viên.'}
                                </p>
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-xl font-bold">
                            Đóng
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-h-[85vh] overflow-y-auto">
                    <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.15fr,0.85fr]">
                        <div className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="form-control md:col-span-2">
                                    <span className="label-text pb-2 text-sm font-bold">Tên assignment *</span>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(event) => updateField('title', event.target.value)}
                                        placeholder="VD: Phân tích component React và đề xuất cách tách state"
                                        className="input input-bordered w-full rounded-2xl"
                                    />
                                </label>

                                <label className="form-control md:col-span-2">
                                    <span className="label-text pb-2 text-sm font-bold">Đề bài *</span>
                                    <textarea
                                        rows={5}
                                        value={form.description}
                                        onChange={(event) => updateField('description', event.target.value)}
                                        placeholder="Mô tả rõ bài toán mà học viên cần giải quyết."
                                        className="textarea textarea-bordered w-full rounded-2xl resize-none"
                                    />
                                </label>

                                <label className="form-control md:col-span-2">
                                    <span className="label-text pb-2 text-sm font-bold">Hướng dẫn nộp bài</span>
                                    <textarea
                                        rows={3}
                                        value={form.instructions}
                                        onChange={(event) => updateField('instructions', event.target.value)}
                                        placeholder="VD: Trả lời tối đa 500 từ, chia thành 3 ý chính, nếu có ví dụ thì ghi rõ."
                                        className="textarea textarea-bordered w-full rounded-2xl resize-none"
                                    />
                                </label>

                                <label className="form-control">
                                    <span className="label-text pb-2 text-sm font-bold">Tổng điểm</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={1000}
                                        value={form.maxScore}
                                        onChange={(event) => updateField('maxScore', Math.max(1, Number(event.target.value) || 100))}
                                        className="input input-bordered w-full rounded-2xl"
                                    />
                                </label>

                                <label className="form-control">
                                    <span className="label-text pb-2 text-sm font-bold">Định dạng nộp bài</span>
                                    <input
                                        type="text"
                                        value={form.submissionFormat}
                                        onChange={(event) => updateField('submissionFormat', event.target.value)}
                                        placeholder="Trả lời bằng văn bản"
                                        className="input input-bordered w-full rounded-2xl"
                                    />
                                </label>

                                <label className="form-control md:col-span-2">
                                    <span className="label-text pb-2 text-sm font-bold">Trọng tâm review AI</span>
                                    <textarea
                                        rows={2}
                                        value={form.reviewFocus}
                                        onChange={(event) => updateField('reviewFocus', event.target.value)}
                                        placeholder="VD: Tập trung vào logic, khả năng phân tích trade-off và mức độ áp dụng đúng React."
                                        className="textarea textarea-bordered w-full rounded-2xl resize-none"
                                    />
                                </label>
                            </div>

                            <div className="rounded-3xl border border-base-300 bg-base-200/35 p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-black text-base-content">Rubric chấm điểm</p>
                                        <p className="text-xs text-base-content/55">Mỗi tiêu chí nên có tên rõ và mô tả ngắn gọn.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddCriterion}
                                        className="btn btn-sm rounded-xl border-none bg-base-100 font-bold text-base-content shadow-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Thêm tiêu chí
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {form.rubricCriteria.map((criterion, index) => (
                                        <div key={criterion.criterionId} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <p className="text-xs font-black uppercase tracking-[0.16em] text-base-content/45">
                                                    {`Tiêu chí ${index + 1}`}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCriterion(criterion.criterionId)}
                                                    disabled={form.rubricCriteria.length === 1}
                                                    className="btn btn-ghost btn-xs rounded-xl text-red-500 disabled:bg-transparent disabled:text-base-content/25"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-[1fr,120px]">
                                                <input
                                                    type="text"
                                                    value={criterion.title}
                                                    onChange={(event) => updateCriterion(criterion.criterionId, 'title', event.target.value)}
                                                    placeholder="VD: Độ đúng yêu cầu"
                                                    className="input input-bordered w-full rounded-xl"
                                                />
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={criterion.maxPoints}
                                                    onChange={(event) => updateCriterion(criterion.criterionId, 'maxPoints', event.target.value)}
                                                    className="input input-bordered w-full rounded-xl"
                                                />
                                            </div>
                                            <textarea
                                                rows={2}
                                                value={criterion.description}
                                                onChange={(event) => updateCriterion(criterion.criterionId, 'description', event.target.value)}
                                                placeholder="Mô tả ngắn gọn để AI và expert biết cần chấm điều gì."
                                                className="textarea textarea-bordered mt-3 w-full rounded-xl resize-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-amber-500/10 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-500/25">
                                        <WandSparkles className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-base-content">Tạo assignment bằng AI</p>
                                        <p className="mt-1 text-xs leading-5 text-base-content/60">
                                            Đưa cho AI chủ đề, bài học hoặc năng lực cần đánh giá. AI sẽ gợi ý đề bài và rubric để bạn chỉnh lại.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <textarea
                                        rows={5}
                                        value={aiPrompt}
                                        onChange={(event) => setAiPrompt(event.target.value)}
                                        placeholder="VD: Tạo assignment cho bài React cơ bản, yêu cầu học viên giải thích state, props và đề xuất cách tách component cho một giao diện đơn giản."
                                        className="textarea textarea-bordered w-full rounded-2xl resize-none bg-base-100"
                                    />
                                    <div className="grid gap-3 sm:grid-cols-[120px,1fr]">
                                        <input
                                            type="number"
                                            min={2}
                                            max={6}
                                            value={aiCriteriaCount}
                                            onChange={(event) => setAiCriteriaCount(Math.max(2, Math.min(6, Number(event.target.value) || 4)))}
                                            className="input input-bordered w-full rounded-2xl bg-base-100"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGenerateWithAI}
                                            disabled={aiGenerating}
                                            className="btn rounded-2xl border-none bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-white shadow-lg shadow-violet-500/25"
                                        >
                                            {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                            Tạo đề bài + rubric
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-base-300 bg-base-100 p-4 shadow-sm">
                                <p className="text-sm font-black text-base-content">Preview nhanh</p>
                                <div className="mt-4 space-y-3">
                                    <div className="rounded-2xl bg-base-200/50 p-3">
                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Đề bài</p>
                                        <p className="mt-2 text-sm font-bold text-base-content">
                                            {form.title || 'Tên assignment sẽ hiển thị ở đây'}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-base-content/65">
                                            {form.description || 'Mô tả assignment sẽ xuất hiện ở đây để bạn preview nhanh.'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-base-200/50 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Chấm điểm</p>
                                            <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-600">
                                                {`${form.maxScore} điểm`}
                                            </span>
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            {form.rubricCriteria.map((criterion) => (
                                                <div key={criterion.criterionId} className="rounded-xl border border-base-300 bg-base-100 px-3 py-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-bold text-base-content">{criterion.title || 'Tiêu chí chưa đặt tên'}</p>
                                                        <span className="text-xs font-bold text-base-content/45">{`${criterion.maxPoints || 0} điểm`}</span>
                                                    </div>
                                                    {criterion.description && (
                                                        <p className="mt-1 text-xs leading-5 text-base-content/60">{criterion.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {submitError && (
                                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
                                    {submitError}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-base-300 px-6 py-4">
                        <button type="button" onClick={onClose} className="btn btn-ghost rounded-2xl font-bold">
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn rounded-2xl border-none bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-white shadow-lg shadow-amber-500/25"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                            Lưu assignment
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/45" onClick={onClose} />
        </div>
    );
}
