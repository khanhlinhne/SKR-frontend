import test from 'node:test';
import assert from 'node:assert/strict';

import { createStudyReviewTransport } from './studyReviewTransport.js';

test('createStudyReviewTransport batches reviews when maxBatchSize is reached', async () => {
    const submittedBatches = [];
    const transport = createStudyReviewTransport({
        maxConcurrent: 1,
        maxBatchSize: 2,
        flushIntervalMs: 1000,
        submitBatch: async (reviews) => {
            submittedBatches.push(reviews.map((review) => review.flashcardItemId));
        },
    });

    transport.enqueue({ flashcardItemId: 'card-1' });
    transport.enqueue({ flashcardItemId: 'card-2' });
    transport.enqueue({ flashcardItemId: 'card-3' });

    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.deepEqual(submittedBatches, [['card-1', 'card-2']]);
    assert.equal(transport.getSnapshot().pendingCount, 1);

    await transport.flushAll();
    assert.deepEqual(submittedBatches, [['card-1', 'card-2'], ['card-3']]);
    assert.equal(transport.getSnapshot().queuedCount, 0);
});

test('createStudyReviewTransport flushes partial batches after flushIntervalMs', async () => {
    const submittedBatches = [];
    const transport = createStudyReviewTransport({
        maxConcurrent: 1,
        maxBatchSize: 5,
        flushIntervalMs: 20,
        submitBatch: async (reviews) => {
            submittedBatches.push(reviews.map((review) => review.flashcardItemId));
        },
    });

    transport.enqueue({ flashcardItemId: 'card-1' });
    transport.enqueue({ flashcardItemId: 'card-2' });

    await new Promise((resolve) => setTimeout(resolve, 5));
    assert.deepEqual(submittedBatches, []);

    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.deepEqual(submittedBatches, [['card-1', 'card-2']]);
    assert.equal(transport.getSnapshot().queuedCount, 0);
});

test('createStudyReviewTransport retries failed batches with backoff', async () => {
    let attempts = 0;
    const errors = [];
    const transport = createStudyReviewTransport({
        maxConcurrent: 1,
        maxAttempts: 2,
        maxBatchSize: 1,
        flushIntervalMs: 5,
        retryBaseDelayMs: 0,
        retryMaxDelayMs: 0,
        submitBatch: async (reviews) => {
            attempts += 1;
            if (attempts === 1) {
                const error = new Error(`temporary failure for ${reviews[0].flashcardItemId}`);
                error.response = { status: 503 };
                throw error;
            }
        },
        onError: (error) => {
            errors.push(error.message);
        },
    });

    transport.enqueue({ flashcardItemId: 'card-3' });

    await transport.flushAll();
    assert.equal(attempts, 2);
    assert.equal(transport.getSnapshot().queuedCount, 0);
    assert.deepEqual(errors, []);
});

test('createStudyReviewTransport stops waiting when flushAll timeout is reached', async () => {
    const transport = createStudyReviewTransport({
        maxConcurrent: 1,
        maxBatchSize: 1,
        flushIntervalMs: 1,
        submitBatch: async () => new Promise(() => {}),
    });

    transport.enqueue({ flashcardItemId: 'card-timeout' });

    await assert.rejects(
        () => transport.flushAll({ timeoutMs: 10 }),
        /timed out/i,
    );

    transport.dispose();
});