# Public Courses Home And Detail Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace homepage mock featured courses with real public course data, turn `/courses/:id` into a public sales page with free lesson previews, and make `Mua ngay` flow through login redirect into course-aware checkout.

**Architecture:** Reuse the existing course API surface and keep learner study at `/courses/:id/learn`, while introducing a public-first shell for `/courses/:id`. The homepage and checkout both read the same normalized course model so featured cards, detail CTA state, and order summary stay consistent.

**Tech Stack:** React, React Router, Axios, Motion, Tailwind/DaisyUI, existing shared API layer

---

## Chunk 1: Data Mapping And Homepage Featured Courses

### Task 1: Centralize public course mapping helpers

**Files:**
- Create: `src/features/courses/utils/publicCourseModel.js`
- Modify: `src/features/home/components/ExpertCoursesSection.jsx`
- Modify: `src/shared/api/subjectApi.js`

- [ ] **Step 1: Add a focused course mapping helper**

Create `src/features/courses/utils/publicCourseModel.js` with helpers that:
- map backend `/courses` payloads into a stable public course model
- format fallback stats, prices, badges, and preview-ready chapter data
- expose helpers for purchase CTA routing based on auth state

- [ ] **Step 2: Point homepage featured section at real API data**

Update `src/features/home/components/ExpertCoursesSection.jsx` to:
- fetch `status=published`, `isFeatured=true`, `limit=3`, `sortBy=displayOrder`, `sortOrder=asc`
- fall back to `published + purchaseCount desc` if fewer than 3 featured courses are returned
- render OwlLoader and lightweight error fallback states

- [ ] **Step 3: Replace mock CTA routing**

Update homepage cards so:
- `Xem khóa học` goes to `/courses/:id`
- `Mua ngay` goes to `/checkout?type=course&id=:id` if authenticated
- unauthenticated users go to `/login?redirect=<encoded checkout url>`

- [ ] **Step 4: Keep API normalization compatible**

Extend `src/shared/api/subjectApi.js` only as needed so list/detail calls still normalize legacy `subject*` fields while preserving course metadata used by the public homepage/detail pages.

### Task 2: Remove homepage dependence on static featured course mocks

**Files:**
- Modify: `src/features/home/constants.js`

- [ ] **Step 1: Delete the obsolete `featuredCourses` export**

Keep the trust-note content but remove the hard-coded featured course data so homepage no longer drifts from backend truth.

- [ ] **Step 2: Verify no other file imports `featuredCourses`**

Run: `rg -n "featuredCourses" src`
Expected: only the planned runtime data path remains.

## Chunk 2: Public Course Detail Route

### Task 3: Build a public-first course detail page for `/courses/:id`

**Files:**
- Create: `src/features/courses/pages/PublicCourseDetail.jsx`
- Create: `src/features/courses/components/PublicCourseHero.jsx`
- Create: `src/features/courses/components/PublicCourseCurriculumPreview.jsx`
- Create: `src/features/courses/components/PublicCoursePurchasePanel.jsx`
- Modify: `src/features/courses/components/index.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create the public detail page shell**

Build `PublicCourseDetail.jsx` that:
- uses `HomeNavBar` and `HomeFooter`
- fetches course detail via `subjectApi.getById(id)`
- renders public loading and error states
- keeps the existing `/courses/:id/learn` learner route untouched

- [ ] **Step 2: Add a sales-page hero**

Create `PublicCourseHero.jsx` to show:
- title, subtitle, instructor, rating, learner count, level, duration
- course banner/preview visual
- breadcrumbs/back link

- [ ] **Step 3: Add curriculum preview with free lessons**

Create `PublicCourseCurriculumPreview.jsx` that:
- treats the first lesson of each chapter as preview when backend does not explicitly mark preview lessons
- shows locked rows for non-preview lessons
- exposes a `Xem trước` action for preview lessons and a clear lock state for the rest

- [ ] **Step 4: Add a sticky purchase panel**

Create `PublicCoursePurchasePanel.jsx` to show:
- price and discount summary
- `Mua ngay`, `Xem bài học miễn phí`, and `Vào học ngay` states
- trust signals and included assets

- [ ] **Step 5: Route `/courses/:id` to the new page**

Update `src/App.jsx` so `/courses/:id` uses `PublicCourseDetail.jsx` while `/courses/:id/learn` continues to render the learner experience.

## Chunk 3: Login Redirect And Course-Aware Checkout

### Task 4: Preserve checkout intent through login

**Files:**
- Modify: `src/features/auth/pages/Login.jsx`

- [ ] **Step 1: Read the `redirect` query param**

If login succeeds:
- navigate to the decoded `redirect` target when present
- otherwise keep the current `/dashboard` behavior

- [ ] **Step 2: Preserve Google sign-in compatibility**

Pass the same redirect value into the Google auth start URL so social sign-in can return to checkout too if the backend already echoes it back.

### Task 5: Make checkout understand course purchases

**Files:**
- Modify: `src/features/checkout/pages/Checkout.jsx`
- Modify: `src/features/checkout/components/OrderSummary.jsx`
- Modify: `src/features/checkout/components/PriceBreakdown.jsx`
- Modify: `src/shared/api/orderApi.js` (only if payload helper is needed)

- [ ] **Step 1: Branch checkout by `type`**

Support:
- existing subscription flow via `plan`
- new course flow via `type=course&id=:courseId`

- [ ] **Step 2: Fetch and render course order summary**

For course checkout:
- fetch course detail
- render course title, instructor, one-time price, included content, and ownership messaging
- hide subscription-only copy

- [ ] **Step 3: Submit a course order if backend accepts it**

Attempt to call `orderApi.create()` with a course-oriented payload based on the backend contract discovered during implementation. If backend lacks course purchase support, keep the UI flow functional and clearly isolate the temporary mock completion path in checkout code.

## Chunk 4: Verification

### Task 6: Verify the integrated flow

**Files:**
- Test: `src/features/home/components/ExpertCoursesSection.jsx`
- Test: `src/features/courses/pages/PublicCourseDetail.jsx`
- Test: `src/features/auth/pages/Login.jsx`
- Test: `src/features/checkout/pages/Checkout.jsx`

- [ ] **Step 1: Lint the touched frontend files**

Run:
`npx eslint src/features/home/components/ExpertCoursesSection.jsx src/features/courses/pages/PublicCourseDetail.jsx src/features/courses/components/PublicCourseHero.jsx src/features/courses/components/PublicCourseCurriculumPreview.jsx src/features/courses/components/PublicCoursePurchasePanel.jsx src/features/auth/pages/Login.jsx src/features/checkout/pages/Checkout.jsx src/features/checkout/components/OrderSummary.jsx src/features/checkout/components/PriceBreakdown.jsx src/features/courses/utils/publicCourseModel.js src/App.jsx src/shared/api/subjectApi.js`

Expected: no ESLint errors.

- [ ] **Step 2: Build the frontend**

Run: `npm run build`
Expected: Vite production build completes successfully or any pre-existing blocker is documented with exact output.

- [ ] **Step 3: Smoke-check important search paths**

Run:
- `rg -n "featuredCourses" src`
- `rg -n "/checkout\\?type=course&id=" src`
- `rg -n "redirect=" src/features/auth src/features/home src/features/courses src/features/checkout`

Expected:
- mock featured course usage removed
- course checkout links present in homepage/detail
- login redirect handling present in the intended files
