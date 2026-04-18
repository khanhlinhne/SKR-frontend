import test from 'node:test';
import assert from 'node:assert/strict';

import {
    normalizePublicFlashcardCards,
    normalizePublicFlashcardSetDetail,
    parsePublicFlashcardDetailPayload,
} from './publicFlashcardModel.js';

test('normalizePublicFlashcardCards maps front/back fields from preview responses', () => {
    const cards = normalizePublicFlashcardCards([
        {
            id: 'card-1',
            front: 'Bubble sort',
            back: 'Sap xep doi cho',
            cardOrder: 1,
        },
    ]);

    assert.deepEqual(cards, [
        {
            id: 'card-1',
            front: 'Bubble sort',
            back: 'Sap xep doi cho',
            order: 1,
            isLocked: false,
        },
    ]);
});

test('parsePublicFlashcardDetailPayload reads preview cards from items responses', () => {
    const payload = parsePublicFlashcardDetailPayload({
        flashcardSetId: 'set-1',
        setTitle: 'Tin hoc - Thuat toan co ban',
        totalCards: 10,
        previewLimit: 4,
        requiresLoginForFullAccess: true,
        tags: ['Tin hoc'],
        items: [
            {
                flashcardItemId: 'card-1',
                front: 'Binary search',
                back: 'Tim kiem nhi phan',
                cardOrder: 0,
            },
        ],
    });

    assert.equal(payload.set.title, 'Tin hoc - Thuat toan co ban');
    assert.equal(payload.cards.length, 1);
    assert.equal(payload.cards[0].front, 'Binary search');
    assert.equal(payload.cards[0].back, 'Tim kiem nhi phan');
});

test('parsePublicFlashcardDetailPayload locks cards after preview limit for guests', () => {
    const payload = parsePublicFlashcardDetailPayload({
        flashcardSetId: 'set-1',
        setTitle: 'Tin hoc - Thuat toan co ban',
        totalCards: 6,
        previewLimit: 4,
        requiresLoginForFullAccess: true,
        cards: Array.from({ length: 6 }, (_, index) => ({
            flashcardItemId: `card-${index + 1}`,
            front: `Front ${index + 1}`,
            back: `Back ${index + 1}`,
            cardOrder: index,
        })),
    });

    assert.equal(payload.cards.length, 6);
    assert.equal(payload.cards[3].isLocked, false);
    assert.equal(payload.cards[4].isLocked, true);
    assert.equal(payload.cards[5].isLocked, true);
});

test('normalizePublicFlashcardSetDetail respects preview limits from the API', () => {
    const detail = normalizePublicFlashcardSetDetail({
        flashcardSetId: 'set-1',
        setTitle: 'Tin hoc - Thuat toan co ban',
        totalCards: 10,
        previewLimit: 4,
        requiresLoginForFullAccess: true,
        tags: ['Tin hoc'],
    });

    assert.equal(detail.previewCardsCount, 4);
    assert.equal(detail.lockedCount, 6);
    assert.equal(detail.isPreview, true);
});
