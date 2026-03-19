import test from 'node:test';
import assert from 'node:assert/strict';

import { mapWithConcurrency } from './mapWithConcurrency.js';

test('mapWithConcurrency respects max concurrency while preserving output order', async () => {
    let activeTasks = 0;
    let peakConcurrency = 0;

    const results = await mapWithConcurrency(
        [1, 2, 3, 4, 5],
        async (value) => {
            activeTasks += 1;
            peakConcurrency = Math.max(peakConcurrency, activeTasks);

            await new Promise((resolve) => setTimeout(resolve, 10));

            activeTasks -= 1;
            return value * 10;
        },
        { concurrency: 2 },
    );

    assert.deepEqual(results, [10, 20, 30, 40, 50]);
    assert.equal(peakConcurrency, 2);
});

test('mapWithConcurrency retries retryable failures before succeeding', async () => {
    const attemptsByItem = new Map();

    const results = await mapWithConcurrency(
        ['deck', 'item'],
        async (value) => {
            const attempts = (attemptsByItem.get(value) || 0) + 1;
            attemptsByItem.set(value, attempts);

            if (value === 'item' && attempts === 1) {
                const error = new Error('temporary failure');
                error.response = { status: 503 };
                throw error;
            }

            return `${value}-${attempts}`;
        },
        {
            concurrency: 1,
            retries: 1,
            retryDelayMs: 0,
        },
    );

    assert.deepEqual(results, ['deck-1', 'item-2']);
    assert.equal(attemptsByItem.get('item'), 2);
});

test('mapWithConcurrency throws when retries are exhausted', async () => {
    await assert.rejects(
        () =>
            mapWithConcurrency(
                [1],
                async () => {
                    const error = new Error('still failing');
                    error.response = { status: 500 };
                    throw error;
                },
                { retries: 1, retryDelayMs: 0 },
            ),
        /still failing/,
    );
});
