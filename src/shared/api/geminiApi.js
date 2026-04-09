const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const FLASHCARD_RESPONSE_SCHEMA = {
    type: 'object',
    properties: {
        cards: {
            type: 'array',
            minItems: 1,
            maxItems: 12,
            items: {
                type: 'object',
                properties: {
                    frontText: {
                        type: 'string',
                        description: 'Mat truoc ngan gon, mot khai niem hoac cau hoi duy nhat.',
                    },
                    backText: {
                        type: 'string',
                        description: 'Mat sau giai thich ngan gon, de nho, chinh xac, toi da 3 cau.',
                    },
                },
                required: ['frontText', 'backText'],
                additionalProperties: false,
            },
        },
    },
    required: ['cards'],
    additionalProperties: false,
};

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
        '- Tra ve dung JSON theo schema, khong them markdown.',
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
                responseJsonSchema: FLASHCARD_RESPONSE_SCHEMA,
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

    let parsed;
    try {
        parsed = JSON.parse(responseText);
    } catch {
        throw new Error('Khong doc duoc JSON flashcard tra ve tu Gemini.');
    }

    const normalizedCards = normalizeGeneratedCards(parsed?.cards);
    if (normalizedCards.length === 0) {
        throw new Error('Gemini chua tao duoc the flashcard hop le tu noi dung nay.');
    }

    return normalizedCards;
}

const geminiApi = {
    generateFlashcards,
};

export default geminiApi;
