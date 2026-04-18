# Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve perceived and actual performance across learning, course detail, admin search, home page, and quiz flows without changing the current information architecture or visual design.

**Architecture:** Use additive, low-risk optimizations. Keep existing UI and route structure intact, keep current endpoint contracts working for existing consumers, and introduce lighter query paths or optional response modes where needed before switching callers. Optimize the heaviest backend reads first, then reduce frontend payload, bundle cost, and unnecessary request frequency.

**Tech Stack:** React 19, Vite, Express 5, Prisma, Axios, Motion, Mammoth

---

## Constraints

- Preserve current page structure, navigation, and visual layout.
- Avoid breaking API contracts already used by other pages.
- Prefer additive changes such as optional query params, helper repository methods, lazy imports, caching, and debouncing.
- Ship in small batches so each batch can be measured and rolled back independently.

## Success Criteria

- Lesson switching no longer reloads the full course tree on every click.
- Public/course detail pages download only the data they need.
- Initial JS for learner/public pages drops noticeably, especially by removing DOCX preview code from the critical path.
- Home page keeps the same appearance but reduces continuous animation and image transfer cost.
- Admin search sends one request after user pause instead of one request per keystroke.
- Prisma uses a single shared client instance everywhere.

## File Map

**Frontend files likely to change**

- Modify: `e:\DoAN\Code\SKR-frontend\src\shared\api\courseApi.js`
- Modify: `e:\DoAN\Code\SKR-frontend\src\shared\api\subjectApi.js`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\learn\pages\Learn.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\courses\pages\PublicCourseDetail.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\courses\pages\CourseDetail.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\learn\components\LearnLessonContent.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\expert\components\DocumentPreviewContent.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\home\components\Hero.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\home\components\SmartFeatures.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\admin\pages\AdminUsers.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\courses\pages\Courses.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\tests\hooks\useQuiz.js`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\profile\pages\Profile.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\vite.config.js`
- Replace/compress: `e:\DoAN\Code\SKR-frontend\src\assets\hero-image.png`
- Replace/compress: `e:\DoAN\Code\SKR-frontend\public\images\courses\python-ai-banner.png`
- Replace/compress: `e:\DoAN\Code\SKR-frontend\public\images\courses\math-banner.png`
- Replace/compress: `e:\DoAN\Code\SKR-frontend\public\images\courses\ielts-banner.png`

**Backend files likely to change**

- Modify: `e:\DoAN\Code\SKR-backend\src\repositories\course.repository.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\services\course.service.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\dtos\course.dto.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\controllers\course.controller.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\routes\course.routes.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\validators\course.validator.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\repositories\enrollment.repository.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\repositories\quiz.repository.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\services\quiz.service.js`

## Chunk 1: Baseline And Guardrails

### Task 1: Capture a performance baseline before changing behavior

**Files:**
- Create: `e:\DoAN\Code\SKR-frontend\docs\superpowers\plans\2026-04-08-performance-baseline.md`

- [ ] Record the current frontend build output from `npm.cmd run build` in `e:\DoAN\Code\SKR-frontend`.
- [ ] Record the current heavy flows to compare after each batch:
  - Learn page first load
  - Lesson switch in learn page
  - Public course detail load
  - Admin users search while typing
  - Home page CPU usage on low-end/mobile emulation
- [ ] Capture before metrics in browser DevTools:
  - Network payload size for `GET /courses/:id`
  - Network payload size for `GET /courses/:courseId/chapters/:chapterId/lessons/:lessonId/content`
  - Number of requests fired when typing 5 characters in Admin Users
  - Initial JS transferred for home page and learn page
- [ ] Save screenshots or copied figures into the baseline doc so later work has a measurable target.

### Task 2: Define compatibility rules for safe rollout

**Files:**
- Modify: `e:\DoAN\Code\SKR-frontend\docs\superpowers\plans\2026-04-08-performance-optimization.md`

- [ ] Document these rollout rules in the implementation notes:
  - Do not remove existing endpoint fields until all callers are switched.
  - Introduce lighter read paths behind query flags or dedicated helpers first.
  - Ship backend read optimizations before switching frontend callers.
  - Validate no visible DOM/layout change on affected pages after each chunk.

## Chunk 2: Eliminate Over-Fetch In The Learning Flow

### Task 3: Add a lightweight validation path for lesson-content requests

**Files:**
- Modify: `e:\DoAN\Code\SKR-backend\src\repositories\course.repository.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\services\course.service.js`

- [ ] Add a repository helper that validates the lesson-to-chapter-to-course relationship without loading full chapter and full course trees.
- [ ] Keep the current `findLessonByIdWithContent(lessonId)` for content payload, but add a lightweight sibling such as `findLessonRouteContext(lessonId)` that selects only:
  - `lesson_id`
  - `chapter_id`
  - `is_active`
  - parent chapter `chapter_id`, `course_id`, `is_active`
  - no videos, no documents, no questions, no sibling lessons
- [ ] Refactor `getLessonContent(courseId, chapterId, lessonId)` to:
  - verify the route using the lightweight relation query
  - fetch the actual lesson content once
  - stop calling `findById(courseId)` and `findChapterById(chapterId)` for this path
- [ ] Keep the response DTO identical to today so the frontend does not need a rendering change.

### Task 4: Verify learn-page behavior against the optimized backend path

**Files:**
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\learn\pages\Learn.jsx`

- [ ] Confirm `Learn.jsx` still fetches the course outline once and lesson content on lesson switch, but no longer pays for backend full-tree reload on every lesson click.
- [ ] Add a short inline comment near the lesson-content effect explaining that the endpoint is intentionally scoped to one lesson payload.
- [ ] Manually verify:
  - switching lessons still updates content correctly
  - loading and error states are unchanged

## Chunk 3: Split Heavy Course Detail Reads Into Full And Lightweight Modes

### Task 5: Add a lightweight course detail response mode for public/learner pages

**Files:**
- Modify: `e:\DoAN\Code\SKR-backend\src\repositories\course.repository.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\services\course.service.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\dtos\course.dto.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\controllers\course.controller.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\validators\course.validator.js`

- [ ] Introduce a lightweight read path for course detail that excludes `chapters[].lessons[]` unless explicitly requested.
- [ ] Keep the existing endpoint shape compatible by using one of these safe options:
  - Option A: `GET /courses/:id?view=summary`
  - Option B: keep `GET /courses/:id` full for existing consumers and add `GET /courses/:id/summary`
- [ ] Prefer Option A only if validators and callers can be updated without ambiguity. Prefer Option B if rollout safety matters more than URL simplicity.
- [ ] Add a DTO function for lightweight detail that returns:
  - course summary fields
  - creator info
  - aggregate counts
  - optionally chapter headers without nested lessons if the page needs chapter count only
- [ ] Leave the current full-detail DTO in place for expert/admin screens that truly need the curriculum tree.

### Task 6: Switch low-risk frontend callers to the lightweight course detail path

**Files:**
- Modify: `e:\DoAN\Code\SKR-frontend\src\shared\api\subjectApi.js`
- Modify: `e:\DoAN\Code\SKR-frontend\src\shared\api\courseApi.js`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\courses\pages\PublicCourseDetail.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\courses\pages\CourseDetail.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\learn\pages\Learn.jsx`

- [ ] Add an opt-in client method for lightweight detail, for example:
  - `subjectApi.getById(id, { view: 'summary' })`
  - `courseApi.getById(id, { view: 'summary' | 'full' })`
- [ ] Update public/course detail pages to use the lightweight response if they do not render the full curriculum tree on first paint.
- [ ] Keep `Learn.jsx` on full detail only if it truly needs chapter and lesson outline on initial load. If yes, keep that one full request and optimize only the lesson-content endpoint.
- [ ] Verify public/course detail pages render exactly the same visible content after the API switch.

## Chunk 4: Reduce Frontend Initial Bundle And Remove DOCX Preview From Critical Path

### Task 7: Lazy-load document preview dependencies

**Files:**
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\learn\components\LearnLessonContent.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\expert\components\DocumentPreviewContent.jsx`

- [ ] Stop importing `DocumentPreviewContent` eagerly in `LearnLessonContent.jsx`.
- [ ] Wrap the preview component in `React.lazy` or a dynamic import that loads only when the preview modal opens.
- [ ] Move the `mammoth` import inside the DOCX preview path so non-DOCX sessions do not load that code.
- [ ] Keep the modal layout, styling, and user interaction unchanged.
- [ ] Verify:
  - opening a PDF/text preview still works
  - opening a DOCX preview still works
  - closing/reopening the modal behaves as before

### Task 8: Improve Vite chunking without changing routes or UI

**Files:**
- Modify: `e:\DoAN\Code\SKR-frontend\vite.config.js`

- [ ] Replace the catch-all `vendor` strategy with more intentional chunk groups for the actually heavy dependencies:
  - `react-core`
  - `router`
  - `axios`
  - `motion`
  - `icons`
  - `doc-preview` for `mammoth`
- [ ] Prevent the learner/public entry chunks from inheriting DOCX preview logic unless the preview feature is opened.
- [ ] Rebuild and compare chunk output with the baseline doc.
- [ ] Treat the circular chunk warning as a regression gate: if it remains, trace the import chain and remove unnecessary cross-feature coupling rather than accepting the warning.

## Chunk 5: Lower Runtime Rendering Cost Without Visual Redesign

### Task 9: Reduce continuous animation work on the home page

**Files:**
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\home\components\Hero.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\home\components\SmartFeatures.jsx`

- [ ] Keep the same sections, copy, and overall look, but reduce always-on animation pressure:
  - replace the 50 ms progress interval with a CSS or motion-driven animation that does not trigger React state updates every tick
  - pause or simplify decorative infinite animations that are off-screen or low-value
  - reduce the number of simultaneously animating particles and blurred backgrounds
  - keep carousel timing and layout familiar while trimming unnecessary state churn
- [ ] Respect reduced-motion settings where possible, but do not change the default visual language.
- [ ] Recheck mobile emulation for scroll smoothness and main-thread activity.

### Task 10: Compress the largest above-the-fold images

**Files:**
- Replace/compress: `e:\DoAN\Code\SKR-frontend\src\assets\hero-image.png`
- Replace/compress: `e:\DoAN\Code\SKR-frontend\public\images\courses\python-ai-banner.png`
- Replace/compress: `e:\DoAN\Code\SKR-frontend\public\images\courses\math-banner.png`
- Replace/compress: `e:\DoAN\Code\SKR-frontend\public\images\courses\ielts-banner.png`

- [ ] Export visually equivalent WebP or AVIF alternatives.
- [ ] Keep dimensions and composition the same so layout does not shift.
- [ ] Update image references only if filenames change.
- [ ] Verify no visible degradation on desktop and mobile breakpoints.

## Chunk 6: Remove Unnecessary API Chatter In Secondary Flows

### Task 11: Properly debounce Admin Users search

**Files:**
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\admin\pages\AdminUsers.jsx`

- [ ] Split `searchTerm` from `debouncedSearchTerm`.
- [ ] Fire `fetchUsers` from the debounced value instead of the raw input value.
- [ ] Keep filter and pagination behavior unchanged.
- [ ] Verify typing 5 fast characters results in one request after the debounce delay, not five requests.

### Task 12: Reduce default list payload on pages that fetch 100 items up front

**Files:**
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\courses\pages\Courses.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\tests\hooks\useQuiz.js`

- [ ] Lower initial `limit` values to the smallest number that still fills the current UI without empty gaps.
- [ ] If the page already paginates or has “load more” behavior, align the request size to that existing UI.
- [ ] Keep the same cards, sections, and pagination controls.
- [ ] Verify there is no visible content loss on first paint.

### Task 13: Reuse the existing profile cache instead of refetching

**Files:**
- Modify: `e:\DoAN\Code\SKR-frontend\src\features\profile\pages\Profile.jsx`
- Modify: `e:\DoAN\Code\SKR-frontend\src\shared\user\useCurrentUserProfile.js` if needed

- [ ] Replace the direct `authApi.getMe()` load path with `useCurrentUserProfile()` where possible.
- [ ] Preserve current loading and error messaging.
- [ ] Verify profile refresh still works after edits or auth changes.

## Chunk 7: Fix Backend Connection And Quiz Read Efficiency

### Task 14: Remove the extra PrismaClient instance

**Files:**
- Modify: `e:\DoAN\Code\SKR-backend\src\repositories\enrollment.repository.js`

- [ ] Replace the local `new PrismaClient()` with the shared singleton from `src/config/prisma.js`.
- [ ] Verify enrollment queries behave identically after the import swap.

### Task 15: Trim quiz candidate reads without changing quiz behavior

**Files:**
- Modify: `e:\DoAN\Code\SKR-backend\src\repositories\quiz.repository.js`
- Modify: `e:\DoAN\Code\SKR-backend\src\services\quiz.service.js`

- [ ] Keep the same quiz generation behavior and randomization rules, but reduce unnecessary over-read:
  - cap candidate size closer to real need
  - avoid selecting large candidate pools when `total_questions` is small
  - keep option loading only for the selected questions if practical
- [ ] If changing the query strategy is risky, apply the safer first pass:
  - reduce `candidateLimit`
  - keep response contract unchanged
- [ ] Verify quiz generation still succeeds for typical practice sizes and still errors correctly when not enough questions exist.

## Chunk 8: Verification, Release, And Rollback

### Task 16: Run final build and smoke verification

**Files:**
- Modify: `e:\DoAN\Code\SKR-frontend\docs\superpowers\plans\2026-04-08-performance-baseline.md`

- [ ] Run in `e:\DoAN\Code\SKR-frontend`:

```bash
npm.cmd run build
```

- [ ] Run in `e:\DoAN\Code\SKR-backend`:

```bash
npm.cmd run prisma:generate
```

- [ ] Manually smoke test these flows:
  - home page render and scrolling
  - public course detail
  - learn page initial load
  - lesson switching
  - document preview modal
  - admin users search
  - quiz practice start
- [ ] Update the baseline doc with after metrics and note the delta for:
  - payload size
  - request count
  - initial JS chunk sizes
  - observed interaction latency

### Task 17: Ship in this order to minimize risk

**Files:**
- Modify: `e:\DoAN\Code\SKR-frontend\docs\superpowers\plans\2026-04-08-performance-optimization.md`

- [ ] Release order:
  1. Backend lesson-content optimization
  2. Prisma singleton fix
  3. Lightweight course detail API
  4. Frontend caller switches
  5. DOCX preview lazy-load and chunking
  6. Admin search debounce and smaller list requests
  7. Home page animation/image optimization
  8. Quiz candidate tuning
- [ ] After each release batch, compare with the baseline doc and stop if any visible regression appears.
- [ ] Keep a rollback note per batch: revert only the current batch, not the full optimization branch.

## Notes For Implementers

- Do not “improve” layout, copy, animation style, or component hierarchy unless it is required for performance.
- Treat payload slimming as a data-contract exercise, not a UI redesign.
- Prefer one measurable change per commit.
- If a change affects both repos, merge backend support first, then switch frontend callers in a second commit.

