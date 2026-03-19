# Public Flashcard Preview Locking Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the full public flashcard set while keeping only the first 4 cards readable for guests and blurring later cards until login.

**Architecture:** Keep the existing public detail page as the main study surface, but move preview gating into the flashcard parsing/model layer so the page receives a full card list with per-card lock state. Extend the page UI with a blurred locked-card treatment and a secondary gallery of all cards so guests can see the whole set structure without reading protected content.

**Tech Stack:** React, React Router, Motion, DaisyUI/Tailwind, Node test runner

---

## Chunk 1: Preview Lock State In Model

### Task 1: Mark cards beyond preview limit as locked

**Files:**
- Modify: `src/features/flashcards/utils/publicFlashcardModel.js`
- Test: `src/features/flashcards/utils/publicFlashcardModel.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
test('parsePublicFlashcardDetailPayload locks cards after preview limit for guests', () => {
    const payload = parsePublicFlashcardDetailPayload({
        flashcardSetId: 'set-1',
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node src/features/flashcards/utils/publicFlashcardModel.test.mjs`
Expected: FAIL because cards after the preview limit are not yet marked locked.

- [ ] **Step 3: Write minimal implementation**

```javascript
const set = normalizePublicFlashcardSetDetail(payload);
const cards = normalizePublicFlashcardCards(source).map((card, index) => ({
    ...card,
    isLocked: set.isPreview ? index >= set.previewCardsCount : false,
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node src/features/flashcards/utils/publicFlashcardModel.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/flashcards/utils/publicFlashcardModel.js src/features/flashcards/utils/publicFlashcardModel.test.mjs
git commit -m "feat: lock public flashcard preview cards"
```

## Chunk 2: Public Detail Locked Card UI

### Task 2: Render all cards while blurring locked ones

**Files:**
- Modify: `src/features/flashcards/pages/PublicFlashcardDetail.jsx`

- [ ] **Step 1: Write the failing test or deterministic check**

Use the existing model test as the lock-state source of truth, then inspect the page logic so it still limits navigation to 4 cards.

- [ ] **Step 2: Update page behavior**

```javascript
const totalPreviewCards = cards.length;
const isLocked = Boolean(currentCard?.isLocked);
```

Add:
- a locked main-card state that still shows content but applies blur/muted styling
- a CTA overlay with login/signup actions
- controls that navigate across the full card list
- a card gallery showing every card, with locked cards blurred

- [ ] **Step 3: Verify manually in code**

Confirm:
- guests can navigate across all cards
- cards after index 3 are blurred
- locked cards do not flip
- CTA points to login/signup and keeps the redirect path

- [ ] **Step 4: Commit**

```bash
git add src/features/flashcards/pages/PublicFlashcardDetail.jsx
git commit -m "feat: show locked public flashcard previews"
```

## Chunk 3: Verification

### Task 3: Run regression checks

**Files:**
- Modify: none

- [ ] **Step 1: Run model tests**

Run: `node src/features/flashcards/utils/publicFlashcardModel.test.mjs`
Expected: PASS

- [ ] **Step 2: Run lint on touched files**

Run: `npx.cmd eslint src/features/flashcards/pages/PublicFlashcardDetail.jsx src/features/flashcards/utils/publicFlashcardModel.js`
Expected: PASS

- [ ] **Step 3: Run production build**

Run: `npm.cmd run build`
Expected: PASS, with only pre-existing non-blocking warnings if any.
