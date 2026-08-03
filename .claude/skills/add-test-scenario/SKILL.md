---
name: add-test-scenario
description: Add a new end-to-end test scenario to the SauceDemo Playwright suite, following this repo's Page Object Model, test-data, tagging, and Allure conventions, then run its quality gates. Use whenever asked to add, extend, or automate a new test case, user flow, or page coverage in tests/.
argument-hint: <scenario or flow to cover, e.g. "add a test for removing all items from the cart">
---

You are adding test coverage to the SauceDemo automation framework (Playwright + TypeScript, Page Object Model, Allure reporting). Don't freelance a structure — this repo has a fixed shape (see `README.md` → "Framework Design Decisions"). Work through these steps in order.

## 1. Scope the scenario

Identify: which flow (`login` / `cart` / `checkout`), which existing spec file it belongs in (`tests/login.spec.ts`, `tests/cart.spec.ts`, `tests/checkout.spec.ts`) or whether it needs a new one, and which tags apply (`@smoke` for critical path only, `@regression` otherwise, plus the feature tag).

## 2. Page objects first

Check whether the flow needs locators/actions that don't exist yet on the relevant class in `pages/`. If they're missing:

- Use the `page-object-builder` subagent (via the Agent tool) to add them — it knows the `BasePage`/`data-test`-locator conventions.
- Don't add raw locators directly inside the test file.

## 3. Test data

If the scenario needs credentials, product info, or expected strings not already in `test-data/`, add them there first (following `test-data/login.data.ts`'s pattern: JSDoc header, exported const, secrets sourced from `config/env.config.ts`). Don't inline literals into the spec.

## 4. Write the spec

Use the `test-author` subagent (via the Agent tool) to write the actual test(s), or write directly if the change is trivial — either way it must match `tests/login.spec.ts`'s shape: `test.describe` grouping, `{ tag: [...] }` on every `test()`, `allure.step()` around each logical action/assertion group, assertions via `expect()`, zero `waitForTimeout()`.

## 5. Verify

Run, in order, and fix anything that fails before considering the task done:

```
npm run type-check
npm run lint
npm run format:check
```

These are exactly what Husky's `pre-commit` hook enforces — a change that fails one of them will be rejected at commit time. Optionally run the `convention-reviewer` subagent for a second pass on repo-specific conventions beyond what the linter catches (locator boundaries, tag completeness, POM boundaries).

Then run the new test(s) directly to confirm they pass against the live site:

```
npx playwright test <path/to/spec.ts> -g "<test name>"
```

## 6. Report back

Summarize what was added: files touched, tags used, and whether `README.md`'s "Test Coverage" table needs a corresponding row (flag it, don't edit it unless asked).
