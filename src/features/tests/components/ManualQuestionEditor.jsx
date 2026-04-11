import Icon from '@/shared/ui/icons/Icon';

function createMultipleChoiceOptions() {
    return [
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
    ];
}

export function createEmptyManualQuestion(id) {
    return {
        id,
        questionText: '',
        questionType: 'multiple_choice',
        options: createMultipleChoiceOptions(),
        trueFalseAnswer: 'true',
    };
}

function createTrueFalseOptions(answer) {
    const isTrueAnswer = answer === 'true';
    return [
        { optionText: 'Đúng', isCorrect: isTrueAnswer },
        { optionText: 'Sai', isCorrect: !isTrueAnswer },
    ];
}

export function normalizeManualQuestionsPayload(questions) {
    const normalized = [];

    for (let index = 0; index < questions.length; index += 1) {
        const question = questions[index];
        const questionText = String(question?.questionText || '').trim();

        if (!questionText) continue;

        if (question.questionType === 'true_false') {
            normalized.push({
                questionText,
                questionType: 'true_false',
                options: createTrueFalseOptions(question.trueFalseAnswer || 'true'),
            });
            continue;
        }

        const options = Array.isArray(question.options)
            ? question.options
                .map((option) => ({
                    optionText: String(option?.optionText || '').trim(),
                    isCorrect: Boolean(option?.isCorrect),
                }))
                .filter((option) => option.optionText)
            : [];

        if (options.length < 2) {
            return { error: `Câu hỏi ${index + 1} cần ít nhất 2 đáp án.` };
        }

        if (!options.some((option) => option.isCorrect)) {
            return { error: `Câu hỏi ${index + 1} cần có ít nhất 1 đáp án đúng.` };
        }

        normalized.push({
            questionText,
            questionType: 'multiple_choice',
            options,
        });
    }

    if (normalized.length === 0) {
        return { error: 'Hãy nhập ít nhất một câu hỏi hợp lệ.' };
    }

    return { data: normalized };
}

export default function ManualQuestionEditor({ questions, onChange }) {
    const updateQuestions = (updater) => {
        onChange(typeof updater === 'function' ? updater(questions) : updater);
    };

    const addQuestion = () => {
        updateQuestions((current) => [...current, createEmptyManualQuestion(Date.now())]);
    };

    const removeQuestion = (id) => {
        updateQuestions((current) => {
            if (current.length === 1) {
                return [createEmptyManualQuestion(Date.now())];
            }
            return current.filter((question) => question.id !== id);
        });
    };

    const updateQuestion = (id, field, value) => {
        updateQuestions((current) => current.map((question) => {
            if (question.id !== id) return question;

            if (field === 'questionType') {
                return {
                    ...question,
                    questionType: value,
                    trueFalseAnswer: 'true',
                    options: value === 'true_false' ? createTrueFalseOptions('true') : createMultipleChoiceOptions(),
                };
            }

            if (field === 'trueFalseAnswer') {
                return {
                    ...question,
                    trueFalseAnswer: value,
                    options: createTrueFalseOptions(value),
                };
            }

            return { ...question, [field]: value };
        }));
    };

    const updateOption = (questionId, optionIndex, field, value) => {
        updateQuestions((current) => current.map((question) => {
            if (question.id !== questionId) return question;

            const nextOptions = [...question.options];
            nextOptions[optionIndex] = { ...nextOptions[optionIndex], [field]: value };

            if (field === 'isCorrect' && value) {
                nextOptions.forEach((option, currentIndex) => {
                    if (currentIndex !== optionIndex) option.isCorrect = false;
                });
            }

            return { ...question, options: nextOptions };
        }));
    };

    const addOption = (questionId) => {
        updateQuestions((current) => current.map((question) => (
            question.id === questionId
                ? { ...question, options: [...question.options, { optionText: '', isCorrect: false }] }
                : question
        )));
    };

    const removeOption = (questionId, optionIndex) => {
        updateQuestions((current) => current.map((question) => {
            if (question.id !== questionId) return question;
            return {
                ...question,
                options: question.options.filter((_, currentIndex) => currentIndex !== optionIndex),
            };
        }));
    };

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-black text-base-content">Nội dung câu hỏi</p>
                        <p className="text-xs text-base-content/60">
                            Nhập trực tiếp câu hỏi cho bài test. Hiện đang hỗ trợ `Trắc nghiệm` và `Đúng/Sai`.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="btn rounded-xl border-none bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                    >
                        <Icon name="Plus" size="sm" />
                        Thêm câu hỏi
                    </button>
                </div>
            </div>

            {questions.map((question, questionIndex) => (
                <div key={question.id} className="rounded-3xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-base-200 bg-base-200/30">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <Icon name="HelpCircle" size="sm" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-base-content">Câu hỏi {questionIndex + 1}</p>
                                <p className="text-xs text-base-content/50">Sẽ được gửi lên backend qua `manualQuestions`.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeQuestion(question.id)}
                            className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-red-500"
                        >
                            <Icon name="Trash2" size="sm" />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold text-sm">Nội dung câu hỏi</span>
                            </label>
                            <textarea
                                rows={3}
                                className="textarea textarea-bordered rounded-2xl focus:border-blue-500 resize-none"
                                placeholder="VD: JavaScript chạy ở đâu?"
                                value={question.questionText}
                                onChange={(event) => updateQuestion(question.id, 'questionText', event.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold text-sm">Loại câu hỏi</span>
                                </label>
                                <select
                                    className="select select-bordered rounded-xl"
                                    value={question.questionType}
                                    onChange={(event) => updateQuestion(question.id, 'questionType', event.target.value)}
                                >
                                    <option value="multiple_choice">Trắc nghiệm</option>
                                    <option value="true_false">Đúng / Sai</option>
                                </select>
                            </div>

                            {question.questionType === 'true_false' && (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-bold text-sm">Đáp án đúng</span>
                                    </label>
                                    <select
                                        className="select select-bordered rounded-xl"
                                        value={question.trueFalseAnswer}
                                        onChange={(event) => updateQuestion(question.id, 'trueFalseAnswer', event.target.value)}
                                    >
                                        <option value="true">Đúng</option>
                                        <option value="false">Sai</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {question.questionType === 'multiple_choice' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="label py-0">
                                        <span className="label-text font-bold text-sm">Các đáp án</span>
                                    </label>
                                    {question.options.length < 6 && (
                                        <button
                                            type="button"
                                            onClick={() => addOption(question.id)}
                                            className="btn btn-sm btn-ghost rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        >
                                            <Icon name="Plus" size="sm" />
                                            Thêm đáp án
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                        <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateOption(question.id, optionIndex, 'isCorrect', !option.isCorrect)}
                                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${option.isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-base-300 bg-white hover:border-emerald-400'}`}
                                            >
                                                {option.isCorrect && <Icon name="CheckCircle2" size="sm" />}
                                            </button>
                                            <input
                                                type="text"
                                                className="input input-bordered flex-1 rounded-xl focus:border-blue-500"
                                                placeholder={`Đáp án ${String.fromCharCode(65 + optionIndex)}`}
                                                value={option.optionText}
                                                onChange={(event) => updateOption(question.id, optionIndex, 'optionText', event.target.value)}
                                            />
                                            {question.options.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(question.id, optionIndex)}
                                                    className="btn btn-ghost btn-sm btn-circle text-red-500 hover:bg-red-50"
                                                >
                                                    <Icon name="X" size="sm" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
