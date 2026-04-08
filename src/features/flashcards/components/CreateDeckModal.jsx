import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';
import { uploadApi } from '@/shared/api';
import { resolveFlashcardImageUrl } from '@/features/flashcards/utils/imageUrl';

const INITIAL_CARD_COUNT = 4;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function createEmptyCard(id) {
    return {
        id,
        front: '',
        back: '',
        frontImageUrl: '',
        backImageUrl: '',
    };
}

function getInitialCards() {
    return Array.from({ length: INITIAL_CARD_COUNT }, (_, index) => createEmptyCard(index + 1));
}

function extractUploadedImageUrl(response) {
    const payload = response?.data?.data || response?.data || response || {};
    return payload.imageUrl || payload.url || payload.secure_url || payload.fileUrl || payload.path || '';
}

export default function CreateDeckModal({ isOpen = true, onClose, onCreate, subjects = [] }) {
    const nextCardIdRef = useRef(INITIAL_CARD_COUNT + 1);
    const [deckName, setDeckName] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('private');
    const [cards, setCards] = useState(() => getInitialCards());
    const [uploadingSlots, setUploadingSlots] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const defaultSubjects = [
        { value: 'math', label: 'Toán Cao Cấp' },
        { value: 'english', label: 'Tiếng Anh' },
        { value: 'programming', label: 'Lập Trình' },
        { value: 'database', label: 'Cơ Sở Dữ Liệu' },
        { value: 'other', label: 'Khác' },
    ];

    const subjectOptions = Array.isArray(subjects) && subjects.length > 0 ? subjects : defaultSubjects;
    const validCards = cards.filter((card) => card.front.trim() && card.back.trim());
    const halfFilledCards = cards.filter(
        (card) => (card.front.trim() || card.back.trim()) && !(card.front.trim() && card.back.trim()),
    );
    const hasUploadingImages = Object.values(uploadingSlots).some(Boolean);

    const resetForm = () => {
        nextCardIdRef.current = INITIAL_CARD_COUNT + 1;
        setDeckName('');
        setSubject('');
        setDescription('');
        setVisibility('private');
        setCards(getInitialCards());
        setUploadingSlots({});
        setFormError('');
        setSubmitting(false);
    };

    const addCardRow = () => {
        setCards((prevCards) => [...prevCards, createEmptyCard(nextCardIdRef.current++)]);
    };

    const updateCard = (cardId, field, value) => {
        setCards((prevCards) =>
            prevCards.map((card) => (card.id === cardId ? { ...card, [field]: value } : card)),
        );
    };

    const removeCard = (cardId) => {
        setCards((prevCards) => {
            if (prevCards.length === 1) {
                return [createEmptyCard(cardId)];
            }

            return prevCards.filter((card) => card.id !== cardId);
        });
    };

    const setSlotUploading = (cardId, side, isUploading) => {
        const slotKey = `${cardId}-${side}`;
        setUploadingSlots((prev) => ({ ...prev, [slotKey]: isUploading }));
    };

    const handleImageUpload = async (cardId, side, file) => {
        if (!file) {
            return;
        }

        if (!file.type?.startsWith('image/')) {
            setFormError('Chỉ hỗ trợ tệp ảnh cho flashcard.');
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setFormError('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
            return;
        }

        const imageField = side === 'front' ? 'frontImageUrl' : 'backImageUrl';

        setFormError('');
        setSlotUploading(cardId, side, true);
        try {
            const response = await uploadApi.uploadImage(file);
            const imageUrl = resolveFlashcardImageUrl(extractUploadedImageUrl(response));
            if (!imageUrl) {
                throw new Error('Không nhận được URL ảnh từ máy chủ.');
            }
            updateCard(cardId, imageField, imageUrl);
        } catch (error) {
            setFormError(error?.response?.data?.message || error?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
        } finally {
            setSlotUploading(cardId, side, false);
        }
    };

    const clearCardImage = (cardId, side) => {
        const imageField = side === 'front' ? 'frontImageUrl' : 'backImageUrl';
        updateCard(cardId, imageField, '');
    };

    const handleClose = () => {
        if (submitting) {
            return;
        }

        resetForm();
        onClose?.();
    };

    const handleSubmit = async () => {
        if (!deckName.trim()) {
            setFormError('Bạn cần nhập tên bộ flashcard.');
            return;
        }

        if (halfFilledCards.length > 0) {
            setFormError('Có thẻ đang nhập dở. Hãy điền đủ cả hai mặt hoặc xóa dòng đó trước khi tạo.');
            return;
        }

        if (validCards.length === 0) {
            setFormError('Hãy thêm ít nhất một thẻ có đủ mặt trước và mặt sau.');
            return;
        }

        if (hasUploadingImages) {
            setFormError('Ảnh đang tải lên. Vui lòng đợi hoàn tất trước khi tạo bộ thẻ.');
            return;
        }

        const selectedSubject = subjectOptions.find((option) => String(option.value) === String(subject));
        setSubmitting(true);
        setFormError('');

        try {
            const created = await onCreate?.({
                name: deckName.trim(),
                subject: selectedSubject?.label || subject,
                courseId: selectedSubject?.courseId || null,
                description: description.trim(),
                visibility,
                cards: validCards.map((card, index) => ({
                    frontText: card.front.trim(),
                    backText: card.back.trim(),
                    frontImageUrl: resolveFlashcardImageUrl(card.frontImageUrl) || null,
                    backImageUrl: resolveFlashcardImageUrl(card.backImageUrl) || null,
                    cardOrder: index,
                })),
            });

            if (created !== true) {
                setFormError('Không thể tạo bộ flashcard lúc này. Hãy kiểm tra lại dữ liệu hoặc thử lại sau.');
                setSubmitting(false);
                return;
            }

            resetForm();
            onClose?.();
        } catch (error) {
            setFormError(error?.message || 'Không thể tạo bộ flashcard lúc này. Vui lòng thử lại.');
            setSubmitting(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={handleClose}
        >
            <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between border-b border-base-300 px-6 py-5 lg:px-8">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
                            <Icon name="BookOpen" size="sm" />
                            Tạo theo kiểu bộ thẻ học
                        </div>
                        <h2 className="text-2xl font-black text-base-content lg:text-3xl">Tạo bộ flashcard mới</h2>
                        <p className="mt-2 text-sm text-base-content/60">
                            Điền tiêu đề và nhập luôn các cặp thuật ngữ - định nghĩa để có thể học ngay sau khi tạo.
                        </p>
                    </div>
                    <button onClick={handleClose} className="btn btn-circle btn-ghost" disabled={submitting}>
                        <Icon name="X" size="lg" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
                    {formError && (
                        <div className="alert alert-error mb-5">
                            <Icon name="AlertCircle" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-[360px,minmax(0,1fr)]">
                        <div className="space-y-4">
                            <div className="rounded-3xl border border-base-300 bg-base-200/60 p-5">
                                <h3 className="mb-4 text-lg font-black text-base-content">Thông tin bộ thẻ</h3>

                                <div className="space-y-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-bold">Tên bộ flashcard</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ví dụ: React Hooks - Chương 1"
                                            className="input input-bordered w-full rounded-2xl"
                                            value={deckName}
                                            onChange={(event) => setDeckName(event.target.value)}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-bold">Môn học</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full rounded-2xl"
                                            value={subject}
                                            onChange={(event) => setSubject(event.target.value)}
                                        >
                                            <option value="">Chọn môn học</option>
                                            {subjectOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-bold">Mô tả</span>
                                        </label>
                                        <textarea
                                            rows={4}
                                            placeholder="Thêm ghi chú ngắn để sau này dễ tìm và chia sẻ hơn."
                                            className="textarea textarea-bordered w-full rounded-2xl"
                                            value={description}
                                            onChange={(event) => setDescription(event.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-base-300 bg-base-100 p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <Icon name="Globe" size="sm" className="text-blue-500" />
                                    <h3 className="text-lg font-black text-base-content">Quyền riêng tư</h3>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => setVisibility('private')}
                                        className={`rounded-2xl border p-4 text-left transition-all ${
                                            visibility === 'private'
                                                ? 'border-blue-500 bg-blue-500/10 shadow-sm'
                                                : 'border-base-300 bg-base-200/40'
                                        }`}
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <Icon name="Lock" size="sm" className="text-base-content" />
                                            <span className="font-bold text-base-content">Riêng tư</span>
                                        </div>
                                        <p className="text-sm text-base-content/60">Chỉ bạn nhìn thấy và học bộ thẻ này.</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setVisibility('public')}
                                        className={`rounded-2xl border p-4 text-left transition-all ${
                                            visibility === 'public'
                                                ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                                                : 'border-base-300 bg-base-200/40'
                                        }`}
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <Icon name="Globe" size="sm" className="text-base-content" />
                                            <span className="font-bold text-base-content">Công khai</span>
                                        </div>
                                        <p className="text-sm text-base-content/60">Người khác có thể tìm thấy và học cùng bạn.</p>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-base-200/70 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-base-content/50">Thẻ hợp lệ</p>
                                    <p className="mt-2 text-2xl font-black text-base-content">{validCards.length}</p>
                                </div>
                                <div className="rounded-2xl bg-base-200/70 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-base-content/50">Đang nhập dở</p>
                                    <p className="mt-2 text-2xl font-black text-base-content">{halfFilledCards.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-base-300 bg-base-100 p-5">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-base-content">Thẻ trong bộ</h3>
                                    <p className="text-sm text-base-content/60">
                                        Nhập ngắn gọn ở mặt trước và giải thích rõ ở mặt sau để học hiệu quả hơn.
                                    </p>
                                </div>
                                <button type="button" onClick={addCardRow} className="btn btn-outline rounded-2xl" disabled={submitting}>
                                    <Icon name="Plus" size="sm" />
                                    Thêm thẻ
                                </button>
                            </div>

                            <div className="mb-3 hidden grid-cols-[56px,minmax(0,1fr),minmax(0,1fr),44px] gap-3 px-1 text-xs font-bold uppercase tracking-wide text-base-content/45 md:grid">
                                <span>STT</span>
                                <span>Mặt trước</span>
                                <span>Mặt sau</span>
                                <span />
                            </div>

                            <div className="space-y-3">
                                {cards.map((card, index) => (
                                    <div
                                        key={card.id}
                                        className="grid gap-3 rounded-3xl border border-base-300 bg-base-200/40 p-4 md:grid-cols-[56px,minmax(0,1fr),minmax(0,1fr),44px]"
                                    >
                                        <div className="flex items-start md:justify-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-base-100 text-sm font-black text-base-content shadow-sm">
                                                {index + 1}
                                            </div>
                                        </div>

                                        <div className="form-control">
                                            <label className="label py-0 md:hidden">
                                                <span className="label-text font-bold">Mặt trước</span>
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={card.front}
                                                onChange={(event) => updateCard(card.id, 'front', event.target.value)}
                                                placeholder="Thuật ngữ, câu hỏi, khái niệm..."
                                                className="textarea textarea-bordered min-h-[110px] w-full rounded-2xl bg-base-100"
                                            />
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <label htmlFor={`front-image-${card.id}`} className="btn btn-xs btn-outline rounded-xl">
                                                    <Icon name="Upload" size="sm" />
                                                    {uploadingSlots[`${card.id}-front`] ? 'Đang tải ảnh...' : 'Thêm ảnh mặt trước'}
                                                </label>
                                                <input
                                                    id={`front-image-${card.id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={submitting || uploadingSlots[`${card.id}-front`]}
                                                    onChange={(event) => {
                                                        const file = event.target.files?.[0];
                                                        if (file) {
                                                            void handleImageUpload(card.id, 'front', file);
                                                        }
                                                        event.target.value = '';
                                                    }}
                                                />
                                                {card.frontImageUrl && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-ghost rounded-xl"
                                                        onClick={() => clearCardImage(card.id, 'front')}
                                                        disabled={submitting}
                                                    >
                                                        <Icon name="X" size="sm" />
                                                        Xóa ảnh
                                                    </button>
                                                )}
                                            </div>
                                            {card.frontImageUrl && (
                                                <div className="mt-2 rounded-2xl border border-base-300 bg-base-100 p-2">
                                                    <img
                                                        src={resolveFlashcardImageUrl(card.frontImageUrl)}
                                                        alt={`Front ${index + 1}`}
                                                        className="h-28 w-full rounded-xl object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-control">
                                            <label className="label py-0 md:hidden">
                                                <span className="label-text font-bold">Mặt sau</span>
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={card.back}
                                                onChange={(event) => updateCard(card.id, 'back', event.target.value)}
                                                placeholder="Định nghĩa, đáp án, ví dụ hoặc ghi chú..."
                                                className="textarea textarea-bordered min-h-[110px] w-full rounded-2xl bg-base-100"
                                            />
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <label htmlFor={`back-image-${card.id}`} className="btn btn-xs btn-outline rounded-xl">
                                                    <Icon name="Upload" size="sm" />
                                                    {uploadingSlots[`${card.id}-back`] ? 'Đang tải ảnh...' : 'Thêm ảnh mặt sau'}
                                                </label>
                                                <input
                                                    id={`back-image-${card.id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={submitting || uploadingSlots[`${card.id}-back`]}
                                                    onChange={(event) => {
                                                        const file = event.target.files?.[0];
                                                        if (file) {
                                                            void handleImageUpload(card.id, 'back', file);
                                                        }
                                                        event.target.value = '';
                                                    }}
                                                />
                                                {card.backImageUrl && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-ghost rounded-xl"
                                                        onClick={() => clearCardImage(card.id, 'back')}
                                                        disabled={submitting}
                                                    >
                                                        <Icon name="X" size="sm" />
                                                        Xóa ảnh
                                                    </button>
                                                )}
                                            </div>
                                            {card.backImageUrl && (
                                                <div className="mt-2 rounded-2xl border border-base-300 bg-base-100 p-2">
                                                    <img
                                                        src={resolveFlashcardImageUrl(card.backImageUrl)}
                                                        alt={`Back ${index + 1}`}
                                                        className="h-28 w-full rounded-xl object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-start justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeCard(card.id)}
                                                className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-error"
                                                aria-label={`Xóa thẻ ${index + 1}`}
                                                disabled={submitting}
                                            >
                                                <Icon name="Trash2" size="sm" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="button" onClick={addCardRow} className="btn btn-ghost mt-4 rounded-2xl" disabled={submitting}>
                                <Icon name="Plus" size="sm" />
                                Thêm một dòng nữa
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-base-300 bg-base-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <p className="text-sm text-base-content/60">
                        Khi bấm tạo, hệ thống sẽ lưu cả bộ thẻ lẫn từng flashcard để bạn học ngay.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={handleClose} className="btn btn-ghost rounded-2xl" disabled={submitting}>
                            Hủy
                        </button>
                        <motion.button
                            whileHover={{ scale: submitting ? 1 : 1.02 }}
                            whileTap={{ scale: submitting ? 1 : 0.98 }}
                            onClick={handleSubmit}
                            disabled={submitting || hasUploadingImages}
                            className="btn rounded-2xl border-none bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-white shadow-lg shadow-blue-600/20"
                        >
                            <Icon name="Sparkles" size="sm" />
                            {submitting ? 'Đang tạo bộ thẻ...' : 'Tạo bộ flashcard'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
