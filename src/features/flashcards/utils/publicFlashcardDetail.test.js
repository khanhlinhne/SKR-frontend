import test from 'node:test';
import assert from 'node:assert/strict';

import { parsePublicFlashcardDetailPayload } from './publicFlashcardDetail.js';

test('parsePublicFlashcardDetailPayload reads backend detail payload from items', () => {
    const payload = {
        flashcardSetId: 'set-1',
        setTitle: 'Tin h?c - Thu?t toán co b?n',
        setDescription: 'Các thu?t toán s?p x?p và tìm ki?m co b?n.',
        visibility: 'public',
        tags: ['Tin h?c'],
        totalCards: 10,
        previewLimit: 4,
        requiresLoginForFullAccess: true,
        creator: {
            displayName: 'System User',
        },
        items: [
            {
                flashcardItemId: 'item-1',
                frontText: 'Bubble Sort',
                backText: 'S?p x?p n?i b?t',
                cardOrder: 0,
                isLocked: false,
            },
            {
                flashcardItemId: 'item-2',
                frontText: 'Binary Search',
                backText: '',
                cardOrder: 1,
                isLocked: true,
            },
        ],
    };

    const result = parsePublicFlashcardDetailPayload(payload);

    assert.equal(result.set.id, 'set-1');
    assert.equal(result.set.title, 'Tin h?c - Thu?t toán co b?n');
    assert.equal(result.set.totalCards, 10);
    assert.equal(result.cards.length, 2);
    assert.deepEqual(result.cards[0], {
        id: 'item-1',
        front: 'Bubble Sort',
        back: 'S?p x?p n?i b?t',
        order: 0,
        isLocked: false,
    });
    assert.equal(result.cards[1].isLocked, true);
});
