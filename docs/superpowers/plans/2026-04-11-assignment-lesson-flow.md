# Assignment Lesson Flow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full assignment lesson flow where experts can create assignments manually or with AI, learners can submit answers inside the course lesson, and experts can review AI-scored submissions on a dedicated page.

**Architecture:** Extend the existing lesson-type system with a new `assignment` type so assignment lives beside video, flashcard, and quiz inside the same curriculum. Keep assignment data and submission/review transport in shared API/helpers, then render separate expert-builder, learner-flow, and expert-review screens on top of that shared shape.

**Tech Stack:** React, React Router, lucide-react, motion, DaisyUI/Tailwind classes, existing axios API layer, existing Gemini helpers.

---

## Chunk 1: Shared transport and model

### Task 1: Add assignment API wrapper and AI helper

**Files:**
- Create: `src/shared/api/assignmentApi.js`
- Modify: `src/shared/api/index.js`
- Modify: `src/shared/api/aiGeminiApi.js`
- Modify: `src/shared/api/geminiApi.js`

- [ ] Add lesson-assignment endpoints for create/update/detail/submission/list/review actions.
- [ ] Normalize assignment payload fields so expert, learner, and review pages read the same shape.
- [ ] Add AI generation helper for assignment prompt + rubric with backend-first and Gemini fallback behavior.
- [ ] Export the new API/helper surface from the shared API barrel.

### Task 2: Add assignment view-model helpers

**Files:**
- Create: `src/features/assignment/utils/assignmentModel.js`

- [ ] Normalize assignment detail data from lesson content.
- [ ] Normalize submission rows for expert review cards/table.
- [ ] Provide small formatting helpers for score, rubric criteria, and learner answer summaries.

## Chunk 2: Expert assignment authoring

### Task 3: Extend curriculum lesson type and add authoring modal

**Files:**
- Modify: `src/features/expert/pages/ExpertCurriculumDetail.jsx`
- Create: `src/features/expert/components/AssignmentBuilderModal.jsx`

- [ ] Add `assignment` to lesson-type config and create flow.
- [ ] Open a dedicated assignment builder modal after creating an assignment lesson.
- [ ] Support manual authoring for title/brief/instructions/max score/rubric criteria.
- [ ] Support AI generation for prompt + rubric from a short topic brief.
- [ ] Save assignment content against the selected course/chapter/lesson.

## Chunk 3: Learner assignment flow

### Task 4: Add assignment lesson player to learn page

**Files:**
- Create: `src/features/learn/components/LearnAssignmentFlow.jsx`
- Modify: `src/features/learn/components/index.js`
- Modify: `src/features/learn/pages/Learn.jsx`

- [ ] Recognize `assignment` as a lesson type in learn-page routing.
- [ ] Render an assignment detail/answer/submit/result flow separate from quiz.
- [ ] Load existing learner submission if available and show AI score/review after submit.
- [ ] Mark the lesson complete after a successful submission.

## Chunk 4: Expert submission review page

### Task 5: Add dedicated expert page for assignment submissions

**Files:**
- Create: `src/features/expert/pages/ExpertAssignments.jsx`
- Modify: `src/features/expert/pages/index.js`
- Modify: `src/features/expert/components/layout/ExpertSidebar.jsx`
- Modify: `src/App.jsx`

- [ ] Add an expert route and sidebar entry for assignment submissions.
- [ ] List submissions with filters/search/status/score summary.
- [ ] Show learner answer, AI score, rubric breakdown, and AI review in a detail panel.
- [ ] Link each submission back to course/chapter/lesson context.

## Chunk 5: Verification

### Task 6: Compile regression check

**Files:**
- None

- [ ] Run the project build.
- [ ] Confirm new assignment files compile and expert/learner routes resolve.
