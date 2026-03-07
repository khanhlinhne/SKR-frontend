import { useState } from 'react';
import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';

export default function CreateDeckModal({ isOpen = true, onClose, onCreate, subjects }) {
    const [deckName, setDeckName] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');

    const defaultSubjects = [
        { value: 'math', label: 'Toán Cao Cấp' },
        { value: 'english', label: 'Tiếng Anh' },
        { value: 'programming', label: 'Lập Trình' },
        { value: 'database', label: 'Cơ Sở Dữ Liệu' },
        { value: 'other', label: 'Khác' }
    ];

    const subjectOptions = subjects || defaultSubjects;

    const handleSubmit = () => {
        if (!deckName.trim()) return;
        onCreate?.({ name: deckName, subject, description });
        setDeckName(''); setSubject(''); setDescription('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-base-100 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-base-300" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-base-content">Tạo Bộ Flashcard Mới</h2>
                        <p className="text-sm text-base-content/60">Điền thông tin để bắt đầu học</p>
                    </div>
                    <button onClick={onClose} className="btn btn-circle btn-ghost"><Icon name="X" size="lg" /></button>
                </div>

                <div className="space-y-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-bold">Tên bộ flashcard</span></label>
                        <input type="text" placeholder="VD: Toán Cao Cấp - Chương 1" className="input input-bordered w-full rounded-xl"
                            value={deckName} onChange={(e) => setDeckName(e.target.value)} />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-bold">Môn học</span></label>
                        <select className="select select-bordered w-full rounded-xl" value={subject} onChange={(e) => setSubject(e.target.value)}>
                            <option value="">Chọn môn học</option>
                            {subjectOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-bold">Mô tả (tùy chọn)</span></label>
                        <textarea placeholder="Thêm mô tả..." className="textarea textarea-bordered w-full rounded-xl" rows={3}
                            value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-3 mb-2">
                            <Icon name="Brain" size="md" color="text-purple-500" />
                            <span className="font-bold">Tạo bằng AI</span>
                            <div className="badge badge-sm badge-warning">Premium</div>
                        </div>
                        <p className="text-sm text-base-content/70 mb-3">Upload PDF để AI tự động tạo flashcards</p>
                        <button className="btn btn-sm btn-outline btn-primary rounded-xl"><Icon name="Sparkles" size="sm" />Tạo với AI</button>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="btn btn-ghost rounded-xl flex-1">Hủy</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
                        disabled={!deckName.trim()} className="btn bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl flex-1 font-bold">
                        <Icon name="Plus" size="md" />Tạo Bộ Flashcard
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
