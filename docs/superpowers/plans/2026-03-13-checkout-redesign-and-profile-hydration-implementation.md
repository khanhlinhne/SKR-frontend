# Checkout Redesign And Profile Hydration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign checkout to match the public apple-style system and ensure avatar/name/email are available immediately after login for checkout confirmation.

**Architecture:** Keep the existing 2-step checkout flow, but replace the shell with a dedicated checkout header and account card. Hydrate current-user profile right after login/callback so checkout reads from shared profile cache instead of waiting for delayed fetches.

**Tech Stack:** React, React Router, Motion, existing shared auth/profile hooks, Tailwind/DaisyUI

---

## Chunk 1: Profile Hydration

### Task 1: Cache profile immediately after successful auth

**Files:**
- Modify: `src/features/auth/pages/Login.jsx`
- Modify: `src/features/auth/pages/GoogleCallback.jsx`
- Modify: `src/shared/user/useCurrentUserProfile.js`

- [ ] Update login success flow to call `authApi.getMe()` after storing token and cache the result with `updateCachedUserProfile()`.
- [ ] Update Google callback success flow to do the same before redirecting.
- [ ] Normalize fallback default name text in `useCurrentUserProfile.js`.

## Chunk 2: Checkout UI Redesign

### Task 2: Introduce dedicated checkout shell components

**Files:**
- Create: `src/features/checkout/components/CheckoutHeader.jsx`
- Create: `src/features/checkout/components/CheckoutAccountCard.jsx`
- Modify: `src/features/checkout/pages/Checkout.jsx`

- [ ] Add a minimal checkout header with logo, security label, and account-aware action space.
- [ ] Add an account card showing avatar, full name, email, and ownership note.
- [ ] Update checkout page layout to use `apple-*` visual language and better spacing on desktop/mobile.

### Task 3: Align order/payment cards with the public design system

**Files:**
- Modify: `src/features/checkout/components/OrderSummary.jsx`
- Modify: `src/features/checkout/components/PriceBreakdown.jsx`
- Modify: `src/features/checkout/components/PaymentMethods.jsx`
- Modify: `src/features/checkout/components/CheckoutSteps.jsx`
- Modify: `src/features/checkout/components/CouponInput.jsx`
- Modify: `src/features/checkout/components/CheckoutSuccess.jsx`

- [ ] Adjust card surfaces, copy, and typography to match public course/homepage design.
- [ ] Keep the same responsibilities per component while reducing visual mismatch with the rest of the app.
- [ ] Preserve course vs subscription behavior.

## Chunk 3: Verification

### Task 4: Verify checkout redesign

**Files:**
- Test: `src/features/auth/pages/Login.jsx`
- Test: `src/features/auth/pages/GoogleCallback.jsx`
- Test: `src/features/checkout/pages/Checkout.jsx`
- Test: `src/features/checkout/components/*.jsx`

- [ ] Run ESLint on all touched auth/profile/checkout files.
- [ ] Run `npm run build`.
- [ ] Confirm `login -> checkout redirect` still works and the account card can render from cached profile data.
