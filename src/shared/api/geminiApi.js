const DEFAULT_GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
];

function readApiKey() {
    return String(import.meta.env.VITE_GEMINI_API_KEY || '').trim();
}

function readModelCandidates() {
    const rawConfiguredModels = String(
        import.meta.env.VITE_GEMINI_MODEL_LIST
        || import.meta.env.VITE_GEMINI_FALLBACK_MODELS
        || '',
    ).trim();

    const candidates = (rawConfiguredModels ? rawConfiguredModels.split(',') : DEFAULT_GEMINI_MODELS)
        .map((model) => String(model || '').trim())
        .filter(Boolean);

    return [...new Set(candidates)];
}

function buildGeminiApiUrl(model) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function createGeminiError(message, options = {}) {
    const error = new Error(message);
    error.geminiStatus = options.status ?? 0;
    error.retryable = options.retryable;
    error.model = options.model || '';
    return error;
}

function extractGeminiErrorMessage(payload, fallbackMessage = '') {
    if (typeof payload?.error?.message === 'string' && payload.error.message.trim()) {
        return payload.error.message.trim();
    }

    if (Array.isArray(payload?.error?.details)) {
        const detailMessage = payload.error.details
            .map((detail) => String(detail?.message || detail?.reason || '').trim())
            .find(Boolean);
        if (detailMessage) {
            return detailMessage;
        }
    }

    return fallbackMessage;
}

function shouldRetryGeminiError(error) {
    if (error?.retryable === false) {
        return false;
    }

    if (error?.retryable === true) {
        return true;
    }

    const status = Number(error?.geminiStatus || error?.status || 0);
    if ([400, 401, 403].includes(status)) {
        return false;
    }

    if (status === 404 || status === 408 || status === 429 || status >= 500) {
        return true;
    }

    const normalizedMessage = String(error?.message || '').trim().toLowerCase();
    return /(quota|rate limit|too many requests|resource exhausted|temporarily unavailable|overloaded|deadline exceeded|timed out|unavailable|model.+not found|not found)/.test(normalizedMessage);
}

async function requestGeminiResponse({ model, apiKey, prompt, temperature }) {
    let response;
    try {
        response = await fetch(buildGeminiApiUrl(model), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature,
                    responseMimeType: 'application/json',
                },
            }),
        });
    } catch (error) {
        throw createGeminiError(
            error?.message || `Khong the ket noi den Gemini model ${model}.`,
            { model, retryable: true },
        );
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw createGeminiError(
            extractGeminiErrorMessage(payload, `Gemini model ${model} khong tra ve ket qua hop le.`),
            {
                model,
                status: response.status,
                retryable: response.status === 404 || response.status === 408 || response.status === 429 || response.status >= 500,
            },
        );
    }

    const responseText = extractResponseText(payload);
    if (!responseText) {
        throw createGeminiError(
            `Gemini model ${model} khong tra ve noi dung.`,
            { model, retryable: true },
        );
    }

    return responseText;
}

async function runGeminiTask({ taskLabel, prompt, temperature, resolveResult }) {
    const apiKey = readApiKey();
    if (!apiKey) {
        throw createGeminiError('Chua cau hinh VITE_GEMINI_API_KEY cho Gemini.', { retryable: false });
    }

    const models = readModelCandidates();
    if (models.length === 0) {
        throw createGeminiError('Chua cau hinh model Gemini de goi AI.', { retryable: false });
    }

    const attempts = [];

    for (let index = 0; index < models.length; index += 1) {
        const model = models[index];

        try {
            const responseText = await requestGeminiResponse({
                model,
                apiKey,
                prompt,
                temperature,
            });

            return resolveResult(responseText, model);
        } catch (error) {
            const errorMessage = String(error?.message || `Gemini model ${model} da that bai.`).trim();
            attempts.push(`${model}: ${errorMessage}`);

            if (index < models.length - 1 && shouldRetryGeminiError(error)) {
                console.warn(`[geminiApi] ${taskLabel} failed with ${model}, trying next model.`, errorMessage);
                continue;
            }

            const usedModels = models.join(', ');
            const finalMessage = attempts.length > 1
                ? `Khong the ${taskLabel} bang AI luc nay. Da thu cac model: ${usedModels}. Loi cuoi: ${errorMessage}`
                : errorMessage;
            throw createGeminiError(finalMessage, {
                model,
                status: error?.geminiStatus || 0,
                retryable: false,
            });
        }
    }

    throw createGeminiError(`Khong the ${taskLabel} bang AI luc nay.`, { retryable: false });
}

function buildFlashcardPrompt({ sourceText, count, contextTitle }) {
    const resolvedCount = Math.max(1, Math.min(12, Number(count) || 5));
    const titleLine = contextTitle?.trim()
        ? `Ngu canh bo flashcard: ${contextTitle.trim()}`
        : 'Ngu canh bo flashcard: Khong co tieu de bo.';

    return [
        'Ban la tro ly tao flashcard hoc tap bang tieng Viet.',
        `Hay tao chinh xac ${resolvedCount} the flashcard tu noi dung nguoi dung cung cap.`,
        titleLine,
        'Yeu cau:',
        '- Moi the chi chua 1 y chinh.',
        '- Mat truoc rat ngan gon, uu tien dang cau hoi hoac khai niem.',
        '- Mat sau giai thich de nho, khong lan man, toi da 3 cau ngan.',
        '- Khong trung lap y giua cac the.',
        '- Neu noi dung dau vao qua it, chi duoc noi suy o muc hop ly va giu dung chu de.',
        '- Tra ve duy nhat JSON hop le, khong them markdown.',
        '- Dinh dang JSON: {"cards":[{"frontText":"...","backText":"..."}]}',
        '',
        'Noi dung dau vao:',
        sourceText.trim(),
    ].join('\n');
}

function buildQuizPrompt({ sourceText, count, contextTitle }) {
    const resolvedCount = Math.max(1, Math.min(10, Number(count) || 3));
    const titleLine = contextTitle?.trim()
        ? `Ngu canh bai hoc: ${contextTitle.trim()}`
        : 'Ngu canh bai hoc: Khong co tieu de bai hoc.';

    return [
        'Ban la tro ly tao cau hoi quiz hoc tap bang tieng Viet cho expert.',
        `Hay tao chinh xac ${resolvedCount} cau hoi quiz dua tren noi dung duoc cung cap.`,
        titleLine,
        'Yeu cau:',
        '- Uu tien cau hoi multiple_choice, chi dung true_false neu rat phu hop.',
        '- Moi cau hoi phai co noi dung ro rang, chinh xac va khong trung lap.',
        '- Moi cau hoi phai co giai thich ngan gon, de expert co the sua nhanh.',
        '- Neu la multiple_choice thi nen co 4 dap an va chi 1 dap an dung.',
        '- Neu la true_false thi tra ve 2 dap an ro rang.',
        '- Khong viet markdown, khong danh so cau hoi, khong them text ngoai JSON.',
        '- Dinh dang JSON: {"questions":[{"questionText":"...","questionType":"multiple_choice","difficultyLevel":"medium","questionExplanation":"...","options":[{"optionText":"...","isCorrect":true}]}]}',
        '',
        'Noi dung dau vao:',
        sourceText.trim(),
    ].join('\n');
}

function buildAssignmentPrompt({ sourceText, criteriaCount, contextTitle }) {
    const resolvedCount = Math.max(2, Math.min(6, Number(criteriaCount) || 4));
    const titleLine = contextTitle?.trim()
        ? `Ngu canh bai hoc: ${contextTitle.trim()}`
        : 'Ngu canh bai hoc: Khong co tieu de bai hoc.';

    return [
        'Ban la tro ly tao assignment hoc tap bang tieng Viet cho expert.',
        'Hay tao 1 bai assignment co de bai ro rang, co huong dan nop bai va rubric cham diem.',
        titleLine,
        `Rubric can co chinh xac ${resolvedCount} tieu chi.`,
        'Yeu cau:',
        '- De bai phai ro, thuc te, phu hop de hoc vien tra loi bang van ban.',
        '- Huong dan nop bai ngan gon, de hoc vien biet can trinh bay nhu the nao.',
        '- Tong diem mac dinh la 100.',
        '- Rubric can can bang giua do dung yeu cau, lap luan va cach trinh bay.',
        '- Khong tra ve markdown, khong them giai thich ngoai JSON.',
        '- Dinh dang JSON: {"assignment":{"title":"...","description":"...","instructions":"...","submissionFormat":"...","maxScore":100,"reviewFocus":"...","rubricCriteria":[{"title":"...","description":"...","maxPoints":25}]}}',
        '',
        'Noi dung dau vao:',
        sourceText.trim(),
    ].join('\n');
}

function buildAssignmentGradingPrompt({ assignment, learnerAnswer, language = 'vi' }) {
    const rubricText = (Array.isArray(assignment?.rubricCriteria) ? assignment.rubricCriteria : [])
        .map((criterion, index) => (
            `${index + 1}. ${criterion.title} (${criterion.maxPoints} diem): ${criterion.description || 'Khong co mo ta bo sung.'}`
        ))
        .join('\n');

    return [
        `Ban la tro ly cham assignment bang ${language === 'en' ? 'English' : 'tieng Viet'}.`,
        'Hay cham bai lam theo rubric duoi day, sau do tra ve JSON hop le.',
        `Tieu de assignment: ${assignment?.title || 'Khong co tieu de'}`,
        `Mo ta de bai: ${assignment?.description || 'Khong co mo ta'}`,
        `Huong dan nop bai: ${assignment?.instructions || 'Khong co huong dan rieng'}`,
        `Tong diem toi da: ${assignment?.maxScore || 100}`,
        assignment?.reviewFocus ? `Luu y review: ${assignment.reviewFocus}` : '',
        'Rubric:',
        rubricText || 'Khong co rubric chi tiet.',
        '',
        'Yeu cau output:',
        '- Score trong khoang 0..maxScore.',
        '- strengths va improvements moi mang 2-4 y gon ngan.',
        '- rubricScores phai co du tieu chi va ghi awardedPoints, maxPoints, feedback.',
        '- Khong viet markdown, khong them text ngoai JSON.',
        '- Dinh dang JSON: {"grade":{"score":82,"summary":"...","strengths":["..."],"improvements":["..."],"rubricScores":[{"criterionTitle":"...","awardedPoints":20,"maxPoints":25,"feedback":"..."}]}}',
        '',
        'Bai lam cua hoc vien:',
        String(learnerAnswer || '').trim() || '(de trong)',
    ].filter(Boolean).join('\n');
}

function buildLearnerAssistantPrompt({ message, messages = [] }) {
    const normalizedHistory = (Array.isArray(messages) ? messages : [])
        .map((item) => {
            const role = String(item?.role || '').trim().toLowerCase();
            const content = String(item?.content || '').trim();

            if (!content) {
                return '';
            }

            if (role === 'assistant' || role === 'model' || role === 'ai') {
                return `Assistant: ${content}`;
            }

            if (role === 'user') {
                return `User: ${content}`;
            }

            return '';
        })
        .filter(Boolean)
        .slice(-10);

    return [
        'Ban la tro ly hoc tap cua ung dung SKR.',
        'Quan trong:',
        '- Luc nay ban KHONG co quyen truy cap du lieu hoc tap thuc te, tien do khoa hoc, thoi gian hoc, lich on tap hay thong tin tai khoan cua nguoi dung.',
        '- Neu nguoi dung hoi ve du lieu ca nhan hoac thong ke thuc te, hay noi ro rang rang backend du lieu tam thoi khong san sang va ban khong the xac minh so lieu.',
        '- Sau khi minh bach gioi han, van co gang dua ra goi y hoc tap huu ich, buoc tiep theo, hoac cach tu kiem tra trong ung dung.',
        '- Tra loi bang tieng Viet, ngan gon, than thien, uu tien tinh thuc dung.',
        '- Neu phu hop, de xuat 2-4 cau hoi goi y tiep theo.',
        '- Tra ve duy nhat JSON hop le, khong them markdown.',
        '- Dinh dang JSON: {"answer":"...","suggestions":["..."]}',
        '',
        'Lich su tro chuyen gan day:',
        normalizedHistory.length > 0 ? normalizedHistory.join('\n') : '(chua co)',
        '',
        `Tin nhan moi nhat cua nguoi dung: ${String(message || '').trim()}`,
    ].join('\n');
}

function extractResponseText(payload) {
    const parts = payload?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) {
        return '';
    }

    return parts
        .map((part) => (typeof part?.text === 'string' ? part.text : ''))
        .join('')
        .trim();
}

function extractJsonText(rawText) {
    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
        return '';
    }

    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fencedMatch?.[1]) {
        return fencedMatch[1].trim();
    }

    const firstBraceIndex = trimmed.indexOf('{');
    const lastBraceIndex = trimmed.lastIndexOf('}');
    if (firstBraceIndex >= 0 && lastBraceIndex > firstBraceIndex) {
        return trimmed.slice(firstBraceIndex, lastBraceIndex + 1);
    }

    return trimmed;
}

function parseJsonResponse(responseText, errorMessage) {
    const jsonText = extractJsonText(responseText);
    if (!jsonText) {
        throw new Error(errorMessage);
    }

    try {
        return JSON.parse(jsonText);
    } catch {
        throw new Error(errorMessage);
    }
}

function normalizeGeneratedCards(cards) {
    if (!Array.isArray(cards)) {
        return [];
    }

    return cards
        .map((card) => ({
            frontText: String(card?.frontText || '').trim(),
            backText: String(card?.backText || '').trim(),
            frontImageUrl: '',
            backImageUrl: '',
        }))
        .filter((card) => card.frontText && card.backText);
}

async function generateFlashcards({ sourceText, count = 5, contextTitle = '' }) {
    const prompt = buildFlashcardPrompt({ sourceText, count, contextTitle });
    return runGeminiTask({
        taskLabel: 'tao flashcard',
        prompt,
        temperature: 0.7,
        resolveResult: (responseText) => {
            const parsed = parseJsonResponse(responseText, 'Khong doc duoc JSON flashcard tra ve tu Gemini.');
            const normalizedCards = normalizeGeneratedCards(parsed?.cards);
            if (normalizedCards.length === 0) {
                throw createGeminiError('Gemini chua tao duoc the flashcard hop le tu noi dung nay.', { retryable: true });
            }

            return normalizedCards;
        },
    });
}

function normalizeQuestionType(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'true_false') {
        return 'true_false';
    }
    return 'multiple_choice';
}

function normalizeDifficultyLevel(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'easy' || normalized === 'hard') {
        return normalized;
    }
    return 'medium';
}

function normalizeCorrectFlag(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;

    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return false;

    return normalized === 'true'
        || normalized === '1'
        || normalized === 'yes'
        || normalized === 'correct';
}

function normalizeGeneratedQuestions(questions) {
    if (!Array.isArray(questions)) {
        return [];
    }

    return questions
        .map((question) => {
            const questionText = String(question?.questionText || '').trim();
            const questionExplanation = String(question?.questionExplanation || '').trim();
            const questionType = normalizeQuestionType(question?.questionType);
            const difficultyLevel = normalizeDifficultyLevel(question?.difficultyLevel);

            const options = Array.isArray(question?.options)
                ? question.options
                    .map((option, index) => ({
                        optionText: String(option?.optionText || '').trim(),
                        isCorrect: normalizeCorrectFlag(option?.isCorrect),
                        optionOrder: index,
                    }))
                    .filter((option) => option.optionText)
                : [];

            if (!questionText || options.length < 2) {
                return null;
            }

            const firstCorrectIndex = options.findIndex((option) => option.isCorrect);
            if (questionType === 'multiple_choice') {
                options.forEach((option, index) => {
                    option.isCorrect = index === (firstCorrectIndex >= 0 ? firstCorrectIndex : 0);
                });
            } else if (firstCorrectIndex < 0) {
                options[0].isCorrect = true;
            }

            return {
                questionText,
                questionType,
                difficultyLevel,
                questionExplanation,
                options,
            };
        })
        .filter(Boolean);
}

function normalizeRubricCriteria(criteria, maxScore = 100) {
    const items = Array.isArray(criteria) ? criteria : [];
    const normalized = items
        .map((criterion, index) => ({
            criterionId: criterion?.criterionId || criterion?.id || `criterion-${index + 1}`,
            title: String(criterion?.title || '').trim(),
            description: String(criterion?.description || '').trim(),
            maxPoints: Math.max(0, Number(criterion?.maxPoints) || 0),
        }))
        .filter((criterion) => criterion.title);

    if (normalized.length > 0) {
        return normalized;
    }

    return [
        { criterionId: 'criterion-1', title: 'Dung yeu cau', description: 'Tra loi dung bai toan va dung trong tam.', maxPoints: Math.round(maxScore * 0.4) },
        { criterionId: 'criterion-2', title: 'Lap luan', description: 'Giai thich ro rang va co logic.', maxPoints: Math.round(maxScore * 0.35) },
        { criterionId: 'criterion-3', title: 'Trinh bay', description: 'Trinh bay gon va de theo doi.', maxPoints: Math.max(5, maxScore - Math.round(maxScore * 0.75)) },
    ];
}

function normalizeGeneratedAssignmentDraft(assignment) {
    const maxScore = Math.max(1, Number(assignment?.maxScore) || 100);
    const rubricCriteria = normalizeRubricCriteria(assignment?.rubricCriteria, maxScore);

    return {
        title: String(assignment?.title || '').trim(),
        description: String(assignment?.description || '').trim(),
        instructions: String(assignment?.instructions || '').trim(),
        submissionFormat: String(
            assignment?.submissionFormat
            || 'Tra loi bang van ban, co the chia thanh cac y nho de de cham diem.',
        ).trim(),
        maxScore,
        reviewFocus: String(assignment?.reviewFocus || '').trim(),
        rubricCriteria,
    };
}

function normalizeAssignmentGrade(grade, assignment = null) {
    const maxScore = Math.max(1, Number(grade?.maxScore) || Number(assignment?.maxScore) || 100);
    const rubricCriteria = Array.isArray(assignment?.rubricCriteria) ? assignment.rubricCriteria : [];
    const rubricScores = (Array.isArray(grade?.rubricScores) ? grade.rubricScores : [])
        .map((criterion, index) => {
            const matched = rubricCriteria.find((item) => item.title === criterion?.criterionTitle) || rubricCriteria[index];
            const maxPoints = Math.max(0, Number(criterion?.maxPoints) || Number(matched?.maxPoints) || 0);

            return {
                criterionId: criterion?.criterionId || matched?.criterionId || `criterion-${index + 1}`,
                criterionTitle: String(criterion?.criterionTitle || matched?.title || `Tieu chi ${index + 1}`).trim(),
                awardedPoints: Math.max(0, Math.min(Number(criterion?.awardedPoints) || 0, maxPoints || maxScore)),
                maxPoints,
                feedback: String(criterion?.feedback || '').trim(),
            };
        })
        .filter((criterion) => criterion.criterionTitle);

    return {
        score: Math.max(0, Math.min(Number(grade?.score) || 0, maxScore)),
        summary: String(grade?.summary || '').trim(),
        strengths: Array.isArray(grade?.strengths)
            ? grade.strengths.map((item) => String(item || '').trim()).filter(Boolean)
            : [],
        improvements: Array.isArray(grade?.improvements)
            ? grade.improvements.map((item) => String(item || '').trim()).filter(Boolean)
            : [],
        rubricScores,
    };
}

async function generateQuizQuestions({ sourceText, count = 3, contextTitle = '' }) {
    const prompt = buildQuizPrompt({ sourceText, count, contextTitle });
    return runGeminiTask({
        taskLabel: 'tao cau hoi',
        prompt,
        temperature: 0.8,
        resolveResult: (responseText) => {
            const parsed = parseJsonResponse(responseText, 'Khong doc duoc JSON cau hoi tra ve tu Gemini.');
            const normalizedQuestions = normalizeGeneratedQuestions(parsed?.questions);
            if (normalizedQuestions.length === 0) {
                throw createGeminiError('Gemini chua tao duoc cau hoi hop le tu noi dung nay.', { retryable: true });
            }

            return normalizedQuestions;
        },
    });
}

async function generateAssignmentDraft({ sourceText, criteriaCount = 4, contextTitle = '' }) {
    const prompt = buildAssignmentPrompt({ sourceText, criteriaCount, contextTitle });
    return runGeminiTask({
        taskLabel: 'tao assignment',
        prompt,
        temperature: 0.8,
        resolveResult: (responseText) => {
            const parsed = parseJsonResponse(responseText, 'Khong doc duoc JSON assignment tra ve tu Gemini.');
            const normalizedAssignment = normalizeGeneratedAssignmentDraft(parsed?.assignment);

            if (!normalizedAssignment.title || !normalizedAssignment.description || normalizedAssignment.rubricCriteria.length === 0) {
                throw createGeminiError('Gemini chua tao duoc assignment hop le tu noi dung nay.', { retryable: true });
            }

            return normalizedAssignment;
        },
    });
}

async function gradeAssignmentSubmission({ assignment, learnerAnswer, language = 'vi' }) {
    const prompt = buildAssignmentGradingPrompt({ assignment, learnerAnswer, language });
    return runGeminiTask({
        taskLabel: 'cham assignment',
        prompt,
        temperature: 0.4,
        resolveResult: (responseText) => {
            const parsed = parseJsonResponse(responseText, 'Khong doc duoc JSON cham assignment tra ve tu Gemini.');
            const normalizedGrade = normalizeAssignmentGrade(parsed?.grade, assignment);

            if (!normalizedGrade.summary && normalizedGrade.rubricScores.length === 0) {
                throw createGeminiError('Gemini chua cham duoc bai assignment hop le.', { retryable: true });
            }

            return normalizedGrade;
        },
    });
}

async function chatWithLearnerAssistant({ message, messages = [] }) {
    const trimmedMessage = String(message || '').trim();
    if (!trimmedMessage) {
        throw createGeminiError('Thieu noi dung de gui toi tro ly hoc tap.', { retryable: false });
    }

    const prompt = buildLearnerAssistantPrompt({
        message: trimmedMessage,
        messages,
    });

    return runGeminiTask({
        taskLabel: 'tra loi tro ly hoc tap',
        prompt,
        temperature: 0.6,
        resolveResult: (responseText, model) => {
            const parsed = parseJsonResponse(responseText, 'Khong doc duoc JSON chat tra ve tu Gemini.');
            const answer = String(parsed?.answer || parsed?.reply || parsed?.message || '').trim();
            const suggestions = Array.isArray(parsed?.suggestions)
                ? parsed.suggestions.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 4)
                : [];

            if (!answer) {
                throw createGeminiError('Gemini chua tao duoc cau tra loi hop le cho tro ly hoc tap.', { retryable: true });
            }

            return {
                answer,
                suggestions,
                provider: 'Google Gemini',
                model,
            };
        },
    });
}

const geminiApi = {
    generateFlashcards,
    generateQuizQuestions,
    generateAssignmentDraft,
    gradeAssignmentSubmission,
    chatWithLearnerAssistant,
};

export default geminiApi;
