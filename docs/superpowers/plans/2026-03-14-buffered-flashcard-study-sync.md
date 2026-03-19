# Buffered Flashcard Study Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make flashcard study progress feel instant by buffering review saves locally and flushing them in the background.

**Architecture:** Extract review buffering into a focused utility that batches pending study reviews on a short timer and flushes them asynchronously without blocking card navigation. Keep the React page optimistic: update study stats and card position immediately, use background sync state for UI messaging, and flush all pending reviews before completing a study session.

**Tech Stack:** React, Node test runner, Vite, existing flashcard API client

---

## Chunk 1: Buffered Review Transport

### Task 1: Add a testable buffer/flush utility

**Files:**
- Create: `src/features/flashcards/utils/studyReviewTransport.js`
- Test: `src/features/flashcards/utils/studyReviewTransport.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
test('createStudyReviewTransport buffers reviews and flushes them as a batch', async () => {
    const submitted = [];
    const transport = createStudyReviewTransport({
        submitReview: async (review) => {
            submitted.push(review.flashcardItemId);
        },
    });

    transport.enqueue({ flashcardItemId: '1' });
    transport.enqueue({ flashcardItemId: '2' });

    assert.equal(transport.getPendingCount(), 2);
    await transport.flushAll();
    assert.deepEqual(submitted, ['1', '2']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node src/features/flashcards/utils/studyReviewTransport.test.mjs`
Expected: FAIL because the transport utility does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create a transport that:
- stores pending reviews in memory
- exposes `enqueue`, `flushAll`, `dispose`, and `subscribe`
- flushes current pending reviews asynchronously through the provided `submitReview`
- reports pending/in-flight counts for UI

- [ ] **Step 4: Run test to verify it passes**

Run: `node src/features/flashcards/utils/studyReviewTransport.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/flashcards/utils/studyReviewTransport.js src/features/flashcards/utils/studyReviewTransport.test.mjs
git commit -m "feat: add buffered flashcard review transport"
```

## Chunk 2: Integrate Buffered Sync Into Flashcards Study Mode

### Task 2: Switch Flashcards study mode to optimistic background syncing

**Files:**
- Modify: `src/features/flashcards/pages/Flashcards.jsx`

- [ ] **Step 1: Replace per-click review queue with transport**

Wire the page to:
- create a transport when a study session starts
- enqueue reviews immediately after each answer
- advance cards/stats without awaiting network
- keep a lightweight sync status in React state

- [ ] **Step 2: Flush before session completion**

Ensure:
- `handleEndStudy` flushes pending reviews before calling `completeStudySession`
- finishing the last card also flushes all pending reviews first
- failures keep the session open and surface an error instead of silently losing progress

- [ ] **Step 3: Update the UI copy**

Show a non-blocking status such as:
- `Đang đồng bộ 3 thẻ ở nền...`

Do not disable answer buttons while background sync is running; only block during final session completion.

- [ ] **Step 4: Commit**

```bash
git add src/features/flashcards/pages/Flashcards.jsx
git commit -m "feat: buffer flashcard study progress sync"
```

## Chunk 3: Verification

### Task 3: Run regression checks

**Files:**
- Modify: none

- [ ] **Step 1: Run utility tests**

Run: `node src/features/flashcards/utils/studyReviewTransport.test.mjs`
Expected: PASS

- [ ] **Step 2: Run flashcard model tests**

Run: `node src/features/flashcards/utils/publicFlashcardModel.test.mjs`
Expected: PASS

- [ ] **Step 3: Run lint on touched files**

Run: `npx.cmd eslint src/features/flashcards/pages/Flashcards.jsx src/features/flashcards/utils/studyReviewTransport.js`
Expected: PASS

- [ ] **Step 4: Run production build**

Run: `npm.cmd run build`
Expected: PASS, with only pre-existing non-blocking warnings if any.
