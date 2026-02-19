import { useState } from 'react';
import * as motion from 'motion/react-client';
import Icon from '../icons/Icon';
import { DIFFICULTY_CONFIG, SUBJECT_CONFIG, QUESTION_TYPE_CONFIG } from './utils';

/**
 * CreateTestModal - Modal tạo bài thi mới
 * Maps to: lrn_practice_tests table
 */
export default function CreateTestModal({ isOpen, onClose, onCreate }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subjectKey: '',
        difficulty: 'medium',
        totalQuestions: 20,
        timeLimitMinutes: 30,
        questionTypes: ['multiple_choice'],
        randomizeQuestions: true,
        randomizeOptions: true,
        showCorrectAnswers: true,
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleQuestionType = (type) => {
        setFormData(prev => ({
            ...prev,
            questionTypes: prev.questionTypes.includes(type)
                ? prev.questionTypes.filter(t => t !== type)
                : [...prev.questionTypes, type]
        }));
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.subjectKey) return;
        onCreate({
            ...formData,
            id: `pt-${Date.now()}`,
            attemptsCount: 0,
            bestScore: null,
            averageScore: null,
            lastAttemptAt: null,
            createdAt: new Date().toISOString(),
            status: 'active',
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-base-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
                                <Icon name="FilePlus2" size="md" className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-base-content">Tạo Bài Thi Mới</h3>
                                <p className="text-xs text-base-content/60">Cấu hình bài thi thử của bạn</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
                            <Icon name="X" size="md" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    {/* Title */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold text-sm">Tên bài thi <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: Toán Cao Cấp - Đạo Hàm"
                            className="input input-bordered w-full rounded-xl focus:border-blue-500"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold text-sm">Mô tả</span>
                        </label>
                        <textarea
                            placeholder="Mô tả ngắn gọn về nội dung bài thi..."
                            className="textarea textarea-bordered w-full rounded-xl focus:border-blue-500 resize-none"
                            rows={2}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>

                    {/* Subject */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold text-sm">Môn học <span className="text-red-500">*</span></span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(SUBJECT_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handleChange('subjectKey', key)}
                                    className={`p-3 rounded-xl border-2 text-center transition-all ${formData.subjectKey === key
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-base-300 hover:border-blue-500/30'
                                        }`}
                                >
                                    <span className="text-lg">{config.icon}</span>
                                    <p className="text-xs font-bold mt-1">{config.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold text-sm">Độ khó</span>
                        </label>
                        <div className="flex gap-2">
                            {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handleChange('difficulty', key)}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 ${formData.difficulty === key
                                        ? `${config.bg} ${config.color} border-current`
                                        : 'border-base-300 text-base-content/60 hover:border-base-content/20'
                                        }`}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Questions & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold text-sm">Số câu hỏi</span>
                            </label>
                            <input
                                type="number"
                                min={5}
                                max={100}
                                className="input input-bordered w-full rounded-xl focus:border-blue-500"
                                value={formData.totalQuestions}
                                onChange={(e) => handleChange('totalQuestions', parseInt(e.target.value) || 20)}
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
                                onChange={(e) => handleChange('timeLimitMinutes', parseInt(e.target.value) || 30)}
                            />
                        </div>
                    </div>

                    {/* Question Types */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold text-sm">Loại câu hỏi</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(QUESTION_TYPE_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
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

                    {/* Options */}
                    <div className="space-y-3">
                        <label className="label">
                            <span className="label-text font-bold text-sm">Tùy chọn</span>
                        </label>
                        {[
                            { key: 'randomizeQuestions', label: 'Trộn thứ tự câu hỏi', icon: 'Shuffle' },
                            { key: 'randomizeOptions', label: 'Trộn thứ tự đáp án', icon: 'ArrowLeftRight' },
                            { key: 'showCorrectAnswers', label: 'Hiện đáp án đúng sau khi nộp', icon: 'Eye' },
                        ].map(opt => (
                            <label key={opt.key} className="flex items-center gap-3 p-3 bg-base-200/50 rounded-xl cursor-pointer hover:bg-base-200 transition-colors">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-sm toggle-primary"
                                    checked={formData[opt.key]}
                                    onChange={(e) => handleChange(opt.key, e.target.checked)}
                                />
                                <Icon name={opt.icon} size="sm" className="text-base-content/60" />
                                <span className="text-sm font-medium">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-base-300 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="btn btn-ghost rounded-xl font-bold">
                        Hủy
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={!formData.title || !formData.subjectKey}
                        className="btn bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-none rounded-xl font-bold shadow-lg shadow-blue-600/20 gap-2 disabled:opacity-50"
                    >
                        <Icon name="Plus" size="md" />
                        Tạo bài thi
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
