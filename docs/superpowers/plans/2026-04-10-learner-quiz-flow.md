# Learner Quiz Flow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the learner quiz lesson flow so quiz lessons open on a detail screen first, then move through dedicated taking, results, and review screens.

**Architecture:** Keep the existing learner layout and curriculum sidebar intact, but replace the single in-place quiz player with a small flow controller inside the learn page. Extract quiz evaluation logic into a dedicated utility so taking, results, and review screens share one normalized question/result model.

**Tech Stack:** React, React Router, motion, lucide-react, Tailwind/DaisyUI styling, existing `courseApi` lesson-content data.

---

## Chunk 1: Flow Architecture

### Task 1: Map quiz lesson screens and ownership

**Files:**
- Modify: `src/features/learn/pages/Learn.jsx`
- Create: `src/features/learn/components/LearnQuizFlow.jsx`
- Create: `src/features/learn/components/learnQuizUtils.js`

- [ ] Define the quiz lesson screen states: `detail`, `taking`, `results`, `review`.
- [ ] Reset the flow to `detail` whenever the learner switches to a different quiz lesson.
- [ ] Store the latest quiz result in learn-page state so `results` and `review` can reuse it without recalculating.
- [ ] Keep non-quiz lessons unchanged.

## Chunk 2: Screen Split

### Task 2: Detail screen

**Files:**
- Create: `src/features/learn/components/LearnQuizFlow.jsx`

- [ ] Render a dedicated quiz detail screen with title, description, chapter info, question count, time limit, and CTA.
- [ ] Show empty-state messaging when the lesson has no questions.

### Task 3: Taking screen

**Files:**
- Create: `src/features/learn/components/LearnQuizFlow.jsx`
- Create: `src/features/learn/components/learnQuizUtils.js`

- [ ] Move the current answering UI into the new flow component.
- [ ] Keep timer, question navigation, flagging, and submit actions.
- [ ] On submit, evaluate answers via the shared utility and forward the computed result to the parent.

### Task 4: Results and review screens

**Files:**
- Create: `src/features/learn/components/LearnQuizFlow.jsx`
- Create: `src/features/learn/components/learnQuizUtils.js`

- [ ] Render a summary-only results screen first.
- [ ] Add a `Xem review` action that opens a separate review screen.
- [ ] Render per-question review with correct/incorrect highlighting and explanation blocks when present.
- [ ] Support `Làm lại`, `Quay lại kết quả`, and `Bài tiếp theo`.

## Chunk 3: Integration

### Task 5: Replace the old learner quiz player

**Files:**
- Modify: `src/features/learn/pages/Learn.jsx`
- Modify: `src/features/learn/components/index.js`
- Delete: `src/features/learn/components/LearnQuizPlayer.jsx`

- [ ] Remove the old one-component quiz implementation.
- [ ] Wire `Learn.jsx` to pass lesson/chapter/next-lesson metadata into the new flow.
- [ ] Mark the lesson complete after a successful submit when it is not already completed.

## Chunk 4: Verification

### Task 6: Regression check

**Files:**
- None

- [ ] Run the project build.
- [ ] Confirm the new components compile and the learn page still renders.
