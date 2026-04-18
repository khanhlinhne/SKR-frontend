# Expert Curriculum Detail Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `ExpertCurriculumDetail.jsx` into smaller focused modules so the curriculum editor is easier to maintain and extend.

**Architecture:** Keep the page container in `ExpertCurriculumDetail.jsx`, then move pure helpers, modal UIs, preview UIs, and dialog UIs into `src/features/expert/components/curriculum-detail/`. Preserve existing behavior and props first; do not redesign logic during the extraction.

**Tech Stack:** React, Vite, lucide-react, motion, DaisyUI/Tailwind

---

## Chunk 1: File Structure

### Task 1: Define extraction targets

**Files:**
- Create: `src/features/expert/components/curriculum-detail/curriculumDetailUtils.js`
- Create: `src/features/expert/components/curriculum-detail/CurriculumDetailModals.jsx`
- Create: `src/features/expert/components/curriculum-detail/CurriculumDetailPreviews.jsx`
- Create: `src/features/expert/components/curriculum-detail/OwlConfirmDialog.jsx`
- Modify: `src/features/expert/pages/ExpertCurriculumDetail.jsx`

- [ ] Move pure helper functions and constants into `curriculumDetailUtils.js`
- [ ] Move chapter/lesson/question/flashcard modal components into `CurriculumDetailModals.jsx`
- [ ] Move preview modal UIs into `CurriculumDetailPreviews.jsx`
- [ ] Move confirm dialog UI into `OwlConfirmDialog.jsx`
- [ ] Reconnect imports in `ExpertCurriculumDetail.jsx`

## Chunk 2: Verification

### Task 2: Verify refactor safety

**Files:**
- Modify: `src/features/expert/pages/ExpertCurriculumDetail.jsx`
- Test: `src/features/expert/pages/ExpertCurriculumDetail.jsx`

- [ ] Run targeted lint on touched files
- [ ] Confirm no missing imports or duplicate declarations remain
- [ ] Keep behavior unchanged for add/edit/delete/preview flows
