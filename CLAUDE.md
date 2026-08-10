# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Playwright + TypeScript end-to-end automation suite for the public site https://www.saucedemo.com, covering Login, Cart, and Checkout. Page Object Model, data-driven tests, Allure reporting. There is no application code here — only tests and the framework around them. All tests hit the live production SauceDemo site; there is no local server to run.

## Commands

```bash
npm test                    # run all tests (chromium, headless)
npm run test:smoke          # tests tagged @smoke
npm run test:regression     # tests tagged @regression
npm run test:login          # tests tagged @login
npm run test:cart           # tests tagged @cart
npm run test:headed         # run with browser visible
npm run test:ci             # CI mode (CI=true → 4 workers, 2 retries)

npx playwright test tests/login.spec.ts              # single file
npx playwright test -g "should login successfully"   # single test by name
npx playwright test --grep @checkout                 # tag not covered by an npm script
npx playwright test --project=chromium                # only one project is defined (chromium)

npm run type-check          # tsc --noEmit
npm run lint                # eslint . --ext .ts,.tsx
npm run lint:fix
npm run format:check        # prettier --check .
npm run format:fix
npm run pre-commit          # type-check && lint && format:check — same as the Husky pre-commit hook

npm run report               # allure:generate + allure:open
npm run allure:serve         # live preview while tests run
npm run clean                # rm -rf allure-results allure-report test-results
```

A Husky `pre-commit` hook runs `npm run pre-commit` (type-check → lint → format:check) on every commit — a change that fails any of these will be rejected at commit time, so run it before considering work done.

## Architecture

**Page Object Model, strictly layered:**

- `pages/BasePage.ts` — abstract base every page class extends. Provides `navigate()`, `getTitle()`, `getCurrentUrl()`, `waitForPageLoad()`. Page classes declare locators as `readonly` fields set in the constructor (never re-queried per call) and expose typed async action/query methods. **Page objects never call `expect()`** — they return data (string/boolean/number); assertions live only in test files.
- `tests/*.spec.ts` — one file per feature (`login`, `cart`, `checkout`), grouped with `test.describe`. Tests call page-object methods only — no raw `page.locator(...)` inside a spec file.
- `test-data/*.data.ts` — credentials, product names/prices, expected error strings. Tests import from here rather than embedding literals; secrets are sourced through `config/env.config.ts` (which reads `.env` via `dotenv`, with hardcoded fallbacks to SauceDemo's public credentials).
- `config/env.config.ts` — the single source for `baseURL` and the four SauceDemo user credential sets (`standardUser`, `lockedOutUser`, `problemUser`, `performanceGlitchUser`).
- `utils/auth.helper.ts` — `createAuthenticatedContext(browser)` logs in once and returns a `BrowserContext` for session reuse across tests that need to start already authenticated; `getAuthenticatedPage(context)` opens a page from that context directly at `/inventory.html`.
- `utils/allure.helper.ts` — `Tags` constants and a thin `allureStep` wrapper around `test.step`.

**Locator strategy, in priority order:** `[data-test="..."]` first (via `page.locator(...)`, matches all existing code). When an element has no `data-test` attribute, use `page.getByRole(...)` (with its accessible name) rather than a CSS class/id selector. Only fall back to CSS class/id selectors (e.g. `.cart_item`, `#react-burger-menu-btn`) when neither `data-test` nor a usable accessible role/name exists — call this out with a comment at the point of use, as the existing page objects do.

**Test structure convention** (see `tests/login.spec.ts` as the reference example):

- Every `test()` takes a third-argument object with `tag: [...]`. Tag taxonomy: `@smoke` (critical path only), `@regression` (everything else), plus exactly one feature tag among `@login`, `@cart`, `@checkout`.
- Logical action/assertion groups are wrapped in `await allure.step('description', async () => { ... })`, imported as `import * as allure from 'allure-js-commons'`.
- Data-driven cases live as arrays in `test-data/` (e.g. `INVALID_CREDENTIALS_CASES`, `EMPTY_FIELD_CASES`) and are expanded with a `for (const {...} of CASES)` loop generating one `test()` per case.
- No hard-coded waits: `page.waitForTimeout()` is never used. All synchronization goes through Playwright auto-waiting, `expect()` (which retries), `waitForURL()`, and `locator.waitFor({ state })`.

**Config** (`playwright.config.ts`): `testDir: ./tests`, `fullyParallel: true`, retries 1 local / 2 CI, workers 2 local / 4 CI, 30s test timeout / 10s expect timeout, `screenshot: only-on-failure`, `video`/`trace: retain-on-failure`. Reporters: `list` + `allure-playwright` (writes to `allure-results/`). Only a `chromium` project is currently defined despite `firefox`/`webkit` being referenced in README examples.

**CI** (`.github/workflows/playwright.yml`): on push to `main`/`develop`, PRs to `main`, or manual dispatch — installs chromium only, runs smoke tests then the full suite (`test:ci`), uploads `allure-results/`, generates and uploads `allure-report/`, and uploads `test-results/` (traces/screenshots/videos) on failure.

## Claude Code setup in this repo

- `.claude/agents/` — subagents for this framework: `test-author` (writes specs), `page-object-builder` (writes `pages/*.ts`), `test-failure-investigator` (diagnoses failures via `allure-results`/`test-results`), `convention-reviewer` (read-only check against the conventions above plus the lint/type-check/format gates).
- `.claude/skills/add-test-scenario/` — `/add-test-scenario` orchestrates the full add-a-test workflow end to end using the subagents above.
- `.mcp.json` — Playwright MCP server (`@playwright/mcp`) for driving a real browser against saucedemo.com to verify locators/flows interactively.
- `.claude/skills/playwright-cli/` — `playwright-cli` skill: a Bash-driven CLI alternative to the MCP server for the same interactive verification (snapshot/click/fill/eval by element ref), plus test generation, tracing, and video recording — see its `SKILL.md` and `references/` for the command reference. `test-author`, `page-object-builder`, and `test-failure-investigator` use this to confirm locators/flows against the live site before encoding them.
