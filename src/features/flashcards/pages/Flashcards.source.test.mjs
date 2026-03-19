import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./Flashcards.jsx', import.meta.url), 'utf8');
const VI_SYNC_TEXT = '\u0110ang \u0111\u1ed3ng b\u1ed9';

test('Flashcards study page keeps Vietnamese UI strings readable', () => {
    const decodedSyncText = VI_SYNC_TEXT.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
        String.fromCharCode(Number.parseInt(code, 16)),
    );

    assert.equal(source.includes(decodedSyncText), true);
    assert.equal(source.includes('flashcard'), true);
});