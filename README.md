# SauceDemo QA Automation Framework

> Playwright + Allure Reporting · TypeScript · Page Object Model

A scalable, CI-ready end-to-end automation framework for [https://www.saucedemo.com](https://www.saucedemo.com), covering Login and Cart functionality with full Allure reporting integration.

---

## Table of Contents

- [Framework Overview](#framework-overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Allure Reporting](#allure-reporting)
- [Test Coverage](#test-coverage)
- [Framework Design Decisions](#framework-design-decisions)
- [Assumptions Made](#assumptions-made)
- [CI/CD Integration](#cicd-integration)

---

## Framework Overview

| Feature | Implementation |
|---|---|
| Test Runner | Playwright Test |
| Language | TypeScript |
| Design Pattern | Page Object Model (POM) |
| Reporting | Allure |
| Parallel Execution | Yes (configurable workers) |
| Tag-based Execution | `@smoke`, `@regression`, `@login`, `@cart` |
| Data-driven Tests | Yes (separate test-data layer) |
| Session Reuse | Auth helper for efficient setup |
| CI Integration | GitHub Actions |
| Retry Mechanism | 1 retry locally, 2 retries in CI |

---

## Project Structure

```
saucedemo-automation/
│
├── config/
│   └── env.config.ts           # Centralized environment variables & credentials
│
├── pages/                      # Page Object Model layer
│   ├── BasePage.ts             # Shared page methods (navigate, getTitle, etc.)
│   ├── LoginPage.ts            # Login page locators & actions
│   ├── InventoryPage.ts        # Inventory/Products page locators & actions
│   └── CartPage.ts             # Cart page locators & actions
│
├── test-data/                  # Decoupled test data
│   ├── login.data.ts           # Login credentials & expected messages
│   └── products.data.ts        # Product names & prices
│
├── tests/                      # Test specifications
│   ├── login.spec.ts           # Login test scenarios (positive, negative, edge)
│   └── cart.spec.ts            # Cart test scenarios (add, validate, remove)
│
├── utils/
│   ├── allure.helper.ts        # Allure step & tag helpers
│   └── auth.helper.ts          # Session reuse utilities
│
├── .github/
│   └── workflows/
│       └── playwright.yml      # GitHub Actions CI pipeline
│
├── .env                        # Environment variables (not committed)
├── .env.example                # Example env file (committed)
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json               # TypeScript configuration
└── README.md
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Java** 8+ (required for Allure CLI report generation)
- **Allure CLI** — install via:

```bash
# macOS
brew install allure

# Linux / Windows (via npm)
npm install -g allure-commandline
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/saucedemo-automation.git
cd saucedemo-automation
```

### 2. Install Node dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install --with-deps
```

### 4. Set up environment variables

```bash
cp .env.example .env
```

The `.env` file is pre-filled with SauceDemo's public credentials. No changes needed to run locally.

---

## Configuration

All configuration is managed through two files:

### `.env` — Runtime environment variables

```env
BASE_URL=https://www.saucedemo.com
STANDARD_USER=standard_user
LOCKED_OUT_USER=locked_out_user
PROBLEM_USER=problem_user
PERFORMANCE_GLITCH_USER=performance_glitch_user
PASSWORD=secret_sauce
```

### `playwright.config.ts` — Playwright settings

Key settings:

| Setting | Value | Description |
|---|---|---|
| `fullyParallel` | `true` | All tests run in parallel |
| `workers` | `2` (local) / `4` (CI) | Concurrent workers |
| `retries` | `1` (local) / `2` (CI) | Auto-retry on failure |
| `screenshot` | `only-on-failure` | Captured in Allure on failure |
| `trace` | `retain-on-failure` | Trace viewer on failure |
| `timeout` | `30s` | Per-test timeout |

---

## Running Tests

### Run all tests

```bash
npm test
```

### Run by tag

```bash
# Smoke tests only (fast sanity check)
npm run test:smoke

# Full regression suite
npm run test:regression

# Login tests only
npm run test:login

# Cart tests only
npm run test:cart
```

### Run with browser visible

```bash
npm run test:headed
```

### Run a specific test file

```bash
npx playwright test tests/login.spec.ts
npx playwright test tests/cart.spec.ts
```

### Run a specific test by name

```bash
npx playwright test -g "should login successfully with valid credentials"
```

### Run in a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
```

### Run for CI

```bash
npm run test:ci
```

---

## Allure Reporting

### Step 1 — Run tests (generates raw results)

```bash
npm test
```

This writes raw JSON data to the `allure-results/` directory.

### Step 2 — Generate the HTML report

```bash
npm run allure:generate
```

### Step 3 — Open the report

```bash
npm run allure:open
```

### One-command shortcut

```bash
npm run report
```

This generates and opens the report in one command.

### Live preview while tests are running

```bash
npm run allure:serve
```

---

### What the Allure Report includes

- **Suites** — tests organised by describe block
- **Categories** — broken down by failure type
- **Timeline** — parallel execution visualisation
- **Test steps** — detailed `allure.step()` breakdown for each test
- **Tags** — `@smoke`, `@regression`, `@login`, `@cart`
- **Screenshots** — automatically captured on test failure
- **Videos** — retained on failure
- **Traces** — Playwright trace files on failure

---

## Test Coverage

### Login Tests (`tests/login.spec.ts`)

#### Positive Scenarios
| Test | Tag |
|---|---|
| Successful login with valid credentials | `@smoke` |
| Login logo is displayed on login page | `@regression` |
| Login form elements render correctly | `@regression` |
| Logout redirects to login page | `@regression` |

#### Negative Scenarios — Invalid Credentials (data-driven)
| Test | Tag |
|---|---|
| Wrong username, correct password | `@regression` |
| Correct username, wrong password | `@regression` |
| Both username and password wrong | `@regression` |

#### Negative Scenarios — Empty Fields (data-driven)
| Test | Tag |
|---|---|
| Empty username field | `@regression` |
| Empty password field | `@regression` |
| Both fields empty | `@regression` |

#### Edge Cases
| Test | Tag |
|---|---|
| Locked out user shows error | `@regression` |
| Dismiss error via X button | `@regression` |
| Session invalidated after logout | `@regression` |
| Whitespace-only credentials | `@regression` |
| SQL injection handled gracefully | `@regression` |
| Very long input strings | `@regression` |

---

### Cart Tests (`tests/cart.spec.ts`)

#### Add to Cart
| Test | Tag |
|---|---|
| Add single product updates badge to 1 | `@smoke` |
| Add multiple products reflects correct badge | `@regression` |
| Button changes to Remove after adding | `@regression` |

#### Cart Page Validation
| Test | Tag |
|---|---|
| Correct product name displayed in cart | `@smoke` |
| Correct product price displayed in cart | `@regression` |
| All added products appear in cart | `@regression` |
| Empty cart shows no items | `@regression` |

#### Remove from Cart
| Test | Tag |
|---|---|
| Remove product from cart page updates count | `@smoke` |
| Remove one of two products decrements badge | `@regression` |
| Remove product from inventory page | `@regression` |
| Remove all items clears badge | `@regression` |
| Continue Shopping returns to inventory | `@regression` |

---

## Framework Design Decisions

### Page Object Model (POM)
Each page of the application has its own class in `pages/`. This ensures:
- Locators are defined once and reused everywhere
- Test files remain clean and readable
- Changes to the UI require updating only one file

### `BasePage` abstract class
All page objects extend `BasePage`, which provides shared methods (`navigate`, `getTitle`, `getCurrentUrl`). This avoids code duplication and enforces a consistent interface.

### Separation of test data
Test data (credentials, product names/prices, error messages) lives in `test-data/`. Tests import data rather than embedding strings. Benefits:
- Updating values requires touching one file
- Data-driven tests are straightforward to extend
- Test files focus on behaviour, not data

### No hard-coded waits
`waitForTimeout()` is never used. All waits use Playwright's built-in auto-wait mechanisms, `waitFor({ state })`, `waitForURL()`, and `expect()` assertions which retry internally.

### Stable locators
All locators use `data-test` attributes (`[data-test="username"]`), which are purpose-built for automation and resistant to style/structure changes.

### Tag-based execution
Tests are tagged with `@smoke` and `@regression` to support tiered CI pipelines — run smoke on every commit and full regression on merges or nightly.

### Allure step annotations
Tests use `allure.step()` to produce structured, human-readable reports. Each test tells a story through its steps.

### Session reuse (auth.helper.ts)
The `createAuthenticatedContext` utility logs in once and reuses the browser context across tests that need an authenticated state — avoiding redundant login steps in large suites.

---

## Assumptions Made

1. **SauceDemo credentials are public** — the `.env.example` includes real credentials since this is a public training site.
2. **Product prices are stable** — prices in `test-data/products.data.ts` reflect the site at time of writing. If the site changes them, update the data file.
3. **`data-test` attributes are stable** — SauceDemo is designed for automation practice, so these selectors are expected to remain consistent.
4. **Java is available for Allure** — the Allure CLI requires Java. Instructions assume it is installed.
5. **Tests run against production SauceDemo** — there is no local server; all tests hit `https://www.saucedemo.com`.

---

## CI/CD Integration

The included `.github/workflows/playwright.yml` pipeline:

1. Triggers on push to `main`/`develop`, on pull requests, or manually.
2. Installs Node.js 20 and Playwright with Chromium.
3. Runs smoke tests first, then the full regression suite.
4. Uploads `allure-results/` and the generated `allure-report/` as build artifacts.
5. Uploads Playwright `test-results/` (screenshots, videos, traces) on failure.

To use with your own GitHub repository:
- No secrets required for default SauceDemo credentials.
- To override, add `BASE_URL` and `PASSWORD` as GitHub repository secrets.
