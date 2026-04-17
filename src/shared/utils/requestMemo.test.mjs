import test from 'node:test';
import assert from 'node:assert/strict';

import { createTimedRequestMemo } from './requestMemo.js';

test('createTimedRequestMemo deduplicates in-flight requests with same key', async () => {
    const memo = createTimedRequestMemo();
    let callCount = 0;

    const loader = async () => {
        callCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { sequence: callCount };
    };

    const [first, second] = await Promise.all([
        memo.run('courses:all', loader, { ttlMs: 100 }),
        memo.run('courses:all', loader, { ttlMs: 100 }),
    ]);

    assert.equal(callCount, 1);
    assert.equal(first.sequence, 1);
    assert.equal(second.sequence, 1);
});

test('createTimedRequestMemo returns cached value within TTL and refreshes after expiration', async () => {
    let now = 1_000;
    const memo = createTimedRequestMemo({ now: () => now });
    let callCount = 0;

    const loader = async () => {
        callCount += 1;
        return { sequence: callCount };
    };

    const first = await memo.run('courses:all', loader, { ttlMs: 100 });
    now += 50;
    const second = await memo.run('courses:all', loader, { ttlMs: 100 });
    now += 101;
    const third = await memo.run('courses:all', loader, { ttlMs: 100 });

    assert.equal(first.sequence, 1);
    assert.equal(second.sequence, 1);
    assert.equal(third.sequence, 2);
    assert.equal(callCount, 2);
});

test('createTimedRequestMemo does not cache rejected loaders', async () => {
    const memo = createTimedRequestMemo();
    let callCount = 0;

    const failingLoader = async () => {
        callCount += 1;
        throw new Error('network failure');
    };

    await assert.rejects(() => memo.run('courses:all', failingLoader, { ttlMs: 100 }), /network failure/);
    await assert.rejects(() => memo.run('courses:all', failingLoader, { ttlMs: 100 }), /network failure/);

    assert.equal(callCount, 2);
});
