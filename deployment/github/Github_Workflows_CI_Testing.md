# GitHub Actions — CI Pipeline (Lint, Test, Type Check)

Run automated checks on every pull request and push — linting, unit tests, and TypeScript type checking.

---

## Table of Contents

- [1. Quick Start — Lint + Test on PR](#1-quick-start--lint--test-on-pr)
- [2. Full CI — Lint, Type Check, Unit Tests](#2-full-ci--lint-type-check-unit-tests)
- [3. CI with MongoDB Service (Integration Tests)](#3-ci-with-mongodb-service-integration-tests)
- [4. Matrix Build — Test on Multiple Node Versions](#4-matrix-build--test-on-multiple-node-versions)

---

## 1. Quick Start — Lint + Test on PR

Run ESLint and tests on every pull request. Blocks merge if checks fail.

```yaml
# .github/workflows/ci.yml

name: CI

on:
  pull_request:
    branches: [main, development]
  push:
    branches: [main, development]

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Run tests
        run: npm test
```

> **Tip:** Add branch protection rule in **Settings → Branches → Add rule** → check **Require status checks to pass**.

---

## 2. Full CI — Lint, Type Check, Unit Tests

Parallel jobs for faster feedback — lint, typecheck, and test run simultaneously.

```yaml
# .github/workflows/ci.yml

name: CI Pipeline

on:
  pull_request:
    branches: [main, development]
  push:
    branches: [main, development]

jobs:
  # ─── Lint ───
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  # ─── Type Check (TypeScript) ───
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npx tsc --noEmit

  # ─── Unit Tests ───
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm test -- --coverage
      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
```

---

## 3. CI with MongoDB Service (Integration Tests)

Spin up a **MongoDB** container alongside tests — perfect for API integration tests.

```yaml
# .github/workflows/ci.yml

name: CI with MongoDB

on:
  pull_request:
    branches: [main, development]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.runCommand({ ping: 1 })'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      MONGO_URI: mongodb://localhost:27017/test_db
      JWT_SECRET: test-jwt-secret-key
      NODE_ENV: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm test

      - name: Run API tests
        run: npm run test:api
```

> **Note:** The MongoDB service container runs alongside your test job. Use `mongodb://localhost:27017` to connect.

---

## 4. Matrix Build — Test on Multiple Node Versions

Ensure your code works across Node.js 18, 20, and 22.

```yaml
# .github/workflows/ci.yml

name: CI Matrix

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test
```
