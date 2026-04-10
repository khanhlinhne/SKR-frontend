import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Trash2, Loader2, CheckCircle2, X } from 'lucide-react';

const EMPTY_OPTION = { optionText: '', isCorrect: false };

function createInitialOptions() {
    return [
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
    ];
}

export default function AddQuestionModal({ open, onClose, onSubmit, loading }) {
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState('multiple_choice');
    const [difficultyLevel, setDifficultyLevel] = useState('medium');
    const [questionExplanation, setQuestionExplanation] = useState('');
    const [options, setOptions] = useState(createInitialOptions);

    const resetForm = () => {
        setQuestionText('');
        setQuestionType('multiple_choice');
        setDifficultyLevel('medium');
        setQuestionExplanation('');
        setOptions(createInitialOptions());
    };

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open]);

    const addOption = () => setOptions([...options, { ...EMPTY_OPTION }]);
    const removeOption = (idx) => setOptions(options.filter((_, i) => i !== idx));
    const updateOption = (idx, field, value) => {
        const next = [...options];
        next[idx] = { ...next[idx], [field]: value };
        if (field === 'isCorrect' && value && questionType === 'multiple_choice') {
            next.forEach((o, i) => { if (i !== idx) o.isCorrect = false; });
        }
        setOptions(next);
    };

    const buildPayload = () => ({
            questionText: questionText.trim(),
            questionType,
            difficultyLevel,
            questionExplanation: questionExplanation.trim() || undefined,
            options: options.filter(o => o.optionText.trim()).map((o, i) => ({
                optionText: o.optionText.trim(),
                isCorrect: o.isCorrect,
                optionOrder: i,
            })),
        });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!questionText.trim()) return;
        onSubmit(buildPayload(), { keepOpen: false });
    };

    const handleSubmitAndContinue = () => {
        if (!questionText.trim()) return;
        onSubmit(buildPayload(), { keepOpen: true });
        resetForm();
    };

    if (!open) return null;

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="modal-box rounded-2xl border border-base-300 shadow-2xl max-w-lg"
            >
                <h3 className="font-black text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 text-white" />
                    </div>
                    Thêm Câu hỏi
                </h3>

                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    {/* Question text */}
                    <div className="form-control">
                        <label className="label py-1"><span className="label-text font-bold text-xs">Nội dung câu hỏi <span className="text-red-500">*</span></span></label>
                        <textarea
                            value={questionText}
                            onChange={e => setQuestionText(e.target.value)}
                            placeholder="VD: Đâu là kết quả đúng của phép tính 2+2?"
                            className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none"
                            rows={2}
                            required
                            autoFocus
                        />
                    </div>

                    {/* Type & Difficulty */}
                    <div className="flex gap-2">
                        <div className="form-control flex-1">
                            <label className="label py-1"><span className="label-text font-bold text-xs">Loại câu hỏi</span></label>
                            <select value={questionType} onChange={e => setQuestionType(e.target.value)} className="select select-bordered select-sm rounded-xl font-medium">
                                <option value="multiple_choice">Trắc nghiệm</option>
                                <option value="true_false">Đúng/Sai</option>
                                <option value="fill_blank">Điền từ</option>
                            </select>
                        </div>
                        <div className="form-control flex-1">
                            <label className="label py-1"><span className="label-text font-bold text-xs">Độ khó</span></label>
                            <select value={difficultyLevel} onChange={e => setDifficultyLevel(e.target.value)} className="select select-bordered select-sm rounded-xl font-medium">
                                <option value="easy">Dễ</option>
                                <option value="medium">Trung bình</option>
                                <option value="hard">Khó</option>
                            </select>
                        </div>
                    </div>

                    {/* Options */}
                    <div>
                        <label className="label py-1"><span className="label-text font-bold text-xs">Đáp án</span></label>
                        <div className="space-y-1.5">
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => updateOption(idx, 'isCorrect', !opt.isCorrect)}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-base-content/20 hover:border-emerald-400'}`}
                                        title={opt.isCorrect ? 'Đáp án đúng' : 'Đánh dấu đúng'}
                                    >
                                        {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </button>
                                    <input
                                        type="text"
                                        value={opt.optionText}
                                        onChange={e => updateOption(idx, 'optionText', e.target.value)}
                                        placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                                        className="input input-bordered input-sm rounded-xl flex-1 font-medium"
                                    />
                                    {options.length > 2 && (
                                        <button type="button" onClick={() => removeOption(idx)} className="btn btn-ghost btn-xs btn-circle text-red-400">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {options.length < 6 && (
                            <button type="button" onClick={addOption} className="btn btn-xs btn-ghost text-violet-600 gap-1 mt-1.5 rounded-lg">
                                <Plus className="w-3 h-3" /> Thêm đáp án
                            </button>
                        )}
                    </div>

                    {/* Explanation */}
                    <div className="form-control">
                        <label className="label py-1"><span className="label-text font-bold text-xs">Giải thích (tuỳ chọn)</span></label>
                        <textarea
                            value={questionExplanation}
                            onChange={e => setQuestionExplanation(e.target.value)}
                            placeholder="Giải thích đáp án đúng..."
                            className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none"
                            rows={2}
                        />
                    </div>

                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">Hủy</button>
                        <button type="button" onClick={handleSubmitAndContinue} disabled={loading} className="btn btn-sm rounded-xl border-amber-200 bg-white font-bold text-amber-600 hover:bg-amber-50 gap-1.5">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Lưu và thêm tiếp
                        </button>
                        <button type="submit" disabled={loading} className="btn btn-sm bg-gradient-to-r from-amber-600 to-orange-600 text-white border-none rounded-xl font-bold gap-1.5">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Thêm câu hỏi
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}
