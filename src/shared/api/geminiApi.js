const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function readApiKey() {
    return String(import.meta.env.VITE_GEMINI_API_KEY || '').trim();
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
    const apiKey = readApiKey();
    if (!apiKey) {
        throw new Error('Chua cau hinh VITE_GEMINI_API_KEY cho Gemini.');
    }

    const prompt = buildFlashcardPrompt({ sourceText, count, contextTitle });
    const response = await fetch(GEMINI_API_URL, {
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
                temperature: 0.7,
                responseMimeType: 'application/json',
            },
        }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(payload?.error?.message || 'Gemini khong tra ve ket qua hop le.');
    }

    const responseText = extractResponseText(payload);
    if (!responseText) {
        throw new Error('Gemini khong tra ve noi dung de tao flashcard.');
    }

    const parsed = parseJsonResponse(responseText, 'Khong doc duoc JSON flashcard tra ve tu Gemini.');

    const normalizedCards = normalizeGeneratedCards(parsed?.cards);
    if (normalizedCards.length === 0) {
        throw new Error('Gemini chua tao duoc the flashcard hop le tu noi dung nay.');
    }

    return normalizedCards;
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
                        isCorrect: Boolean(option?.isCorrect),
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

async function generateQuizQuestions({ sourceText, count = 3, contextTitle = '' }) {
    const apiKey = readApiKey();
    if (!apiKey) {
        throw new Error('Chua cau hinh VITE_GEMINI_API_KEY cho Gemini.');
    }

    const prompt = buildQuizPrompt({ sourceText, count, contextTitle });
    const response = await fetch(GEMINI_API_URL, {
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
                temperature: 0.8,
                responseMimeType: 'application/json',
            },
        }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(payload?.error?.message || 'Gemini khong tra ve ket qua hop le.');
    }

    const responseText = extractResponseText(payload);
    if (!responseText) {
        throw new Error('Gemini khong tra ve noi dung de tao cau hoi.');
    }

    const parsed = parseJsonResponse(responseText, 'Khong doc duoc JSON cau hoi tra ve tu Gemini.');

    const normalizedQuestions = normalizeGeneratedQuestions(parsed?.questions);
    if (normalizedQuestions.length === 0) {
        throw new Error('Gemini chua tao duoc cau hoi hop le tu noi dung nay.');
    }

    return normalizedQuestions;
}

const geminiApi = {
    generateFlashcards,
    generateQuizQuestions,
};

export default geminiApi;
