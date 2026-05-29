# GitHub Actions — Complete Guide (Part 1)

> Last Updated: February 28, 2026

## Table of Contents

- [What is GitHub Actions?](#what-is-github-actions)
- [Core Components](#core-components)
  - [Workflows](#workflows)
  - [Jobs](#jobs)
  - [Steps](#steps)
  - [Actions](#actions)
  - [Runners](#runners)
- [Defining Workflows](#defining-workflows)
  - [Workflow File Structure](#workflow-file-structure)
  - [Basic Workflow Example](#basic-workflow-example)
- [Events and Triggers](#events-and-triggers)
  - [Repository-Related Events](#repository-related-events)
  - [Other Events](#other-events)
  - [Activity Types](#activity-types)
  - [Event Filters](#event-filters)
- [Pull Requests and Forks](#pull-requests-and-forks)
- [Cancelling and Skipping Workflows](#cancelling-and-skipping-workflows)
- [Workflow Execution](#workflow-execution)
- [Artifacts](#artifacts)
- [Outputs](#outputs)
- [Caching](#caching)
- [Environment Variables](#environment-variables)
- [Secrets](#secrets)
- [GitHub Actions Environments](#github-actions-environments)

---

## What is GitHub Actions?

GitHub Actions is a **CI/CD platform** built into GitHub that allows you to automate your build, test, and deployment workflows directly from your repository. You define workflows in YAML files, and they run automatically based on events like pushes, pull requests, schedules, and more.

---

## Core Components

GitHub Actions has **four** core building blocks:

```
Workflows  →  Define Events + Jobs
Jobs       →  Define Runner + Steps
Steps      →  Do the actual work
Actions    →  Reusable commands (official, community, or custom)
```

### Visual Overview

```
┌─────────────────── Workflow ───────────────────┐
│  Event (trigger)                                │
│                                                 │
│  ┌──── Job 1 ────┐    ┌──── Job 2 ────┐       │
│  │  Runner: OS    │    │  Runner: OS    │       │
│  │                │    │                │       │
│  │  Step 1        │    │  Step 1        │       │
│  │  Step 2        │    │  Step 2        │       │
│  │  Step 3        │    │  Step 3        │       │
│  └────────────────┘    └────────────────┘       │
│     (parallel by default)                       │
└─────────────────────────────────────────────────┘
```

---

### Workflows

- Attached to a **GitHub repository**
- Contain **one or more Jobs**
- Triggered upon **Events**
- Defined in `.github/workflows/<file>.yml`

---

### Jobs

- Define a **Runner** (execution environment)
- Contain **one or more Steps**
- Run in **parallel** (by default) or **sequential**
- Can be **conditional**

---

### Steps

- Execute a **shell script** or an **Action**
- Can use **custom** or **third-party** Actions
- Steps run in order (top to bottom) within a job

---

### Actions

- You can run **shell commands** directly
- You can also use **pre-defined Actions**:
  - **Official** — maintained by GitHub (e.g., `actions/checkout`)
  - **Community** — created by the community (available on GitHub Marketplace)
  - **Custom** — your own reusable actions

---

### Runners

- Servers (machines) that **execute the jobs**
- **Pre-defined Runners** with different OS are available:

| Runner | Label |
|--------|-------|
| Ubuntu Linux | `ubuntu-latest`, `ubuntu-22.04` |
| Windows | `windows-latest`, `windows-2022` |
| macOS | `macos-latest`, `macos-14` |

- You can also create **custom/self-hosted Runners**

---

## Defining Workflows

### Workflow File Structure

Workflows must be placed inside the `.github/workflows/` directory in your repository:

```
your-repo/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── test.yml
├── src/
└── package.json
```

- Files must follow **GitHub Actions YAML syntax**
- Can be created on GitHub directly or locally

---

### Basic Workflow Example

```yaml
name: CI Pipeline               # Workflow name (displayed on GitHub)

on:                              # Event(s) that trigger the workflow
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:                            # One or more jobs
  build:                         # Job ID
    runs-on: ubuntu-latest       # Runner

    steps:                       # Steps inside the job
      - name: Checkout Code
        uses: actions/checkout@v4          # Use an Action

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm install                    # Run shell command

      - name: Run Tests
        run: npm test
```

---

## Events and Triggers

Workflows are triggered by **events**. A workflow must have **at least one event**, but can have **multiple**.

### Repository-Related Events

| Event | Trigger Description |
|-------|-------------------|
| `push` | Pushing a commit |
| `pull_request` | Pull request action (opened, closed, edited, etc.) |
| `create` | A branch or tag was created |
| `fork` | Repository was forked |
| `issues` | An issue was opened, deleted, etc. |
| `issue_comment` | Issue or pull request comment action |
| `watch` | Repository was starred |
| `discussion` | Discussion action (created, deleted, etc.) |
| `release` | A release was published, created, etc. |
| `pull_request_review` | A pull request review was submitted |

> **Many more events available!** See [GitHub Docs — Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)

---

### Other Events

| Event | Trigger Description |
|-------|-------------------|
| `workflow_dispatch` | **Manually** trigger a workflow from GitHub UI |
| `repository_dispatch` | **REST API** request triggers the workflow |
| `schedule` | Workflow runs on a **cron schedule** |
| `workflow_call` | Can be **called by other workflows** (reusable workflow) |

#### Examples

**Manual Trigger:**

```yaml
on:
  workflow_dispatch:
```

**Cron Schedule (every day at midnight UTC):**

```yaml
on:
  schedule:
    - cron: '0 0 * * *'
```

**Called by Another Workflow:**

```yaml
on:
  workflow_call:
```

---

### Activity Types

Activity types let you specify the **exact type of event** that should trigger a workflow.

```yaml
on:
  pull_request:
    types: [opened, edited, synchronize]    # Only these PR actions trigger

  issues:
    types: [opened, labeled]                # Only when issue is opened or labeled
```

> Without specifying `types`, the default activity types for that event are used.

---

### Event Filters

For `push` and `pull_request` events, you can add **filters** to control when the workflow runs.

**Filter by Branch:**

```yaml
on:
  push:
    branches:
      - main
      - 'release/**'               # Wildcard pattern
    branches-ignore:
      - 'feature/**'               # Ignore feature branches
```

**Filter by File Path:**

```yaml
on:
  push:
    paths:
      - 'src/**'                    # Only trigger if files in src/ changed
    paths-ignore:
      - 'docs/**'                   # Ignore changes in docs/
```

**Combine Branch + Path Filters:**

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
```

---

## Pull Requests and Forks

- **Initial approval is needed** for pull requests from forked repositories
- This avoids **spam and malicious code** execution from untrusted contributors
- First-time contributors need a maintainer to approve the workflow run

---

## Cancelling and Skipping Workflows

### Automatic Cancellation

- Workflows get **cancelled automatically** when a job fails (by default)

### Manual Cancellation

- You can **manually cancel** a running workflow from the GitHub Actions tab

### Skip Workflow Execution

Add specific keywords in your **commit message** to skip workflow runs:

```bash
git commit -m "update readme [skip ci]"
git commit -m "minor fix [no ci]"
```

Supported skip keywords:
- `[skip ci]`
- `[ci skip]`
- `[no ci]`
- `[skip actions]`
- `[actions skip]`

---

## Workflow Execution

- Workflows are executed **when their events are triggered**
- GitHub provides **detailed insights** into job execution including:
  - Real-time logs for each step
  - Status indicators (success, failure, skipped)
  - Timing information
  - Re-run options for failed workflows

---

## Artifacts

Jobs often produce **assets** that should be shared or analyzed.

### What Are Artifacts?

- Deployable website files, logs, binaries, test reports, etc.
- These assets are referred to as **"Artifacts"** (or **"Job Artifacts"**)
- GitHub Actions provides dedicated Actions for **uploading** and **downloading** artifacts

### Upload Artifact

```yaml
steps:
  - name: Build Project
    run: npm run build

  - name: Upload Build Artifact
    uses: actions/upload-artifact@v4
    with:
      name: build-output
      path: dist/                     # Path to upload
      retention-days: 7               # How long to keep (default: 90 days)
```

### Download Artifact (in another job)

```yaml
jobs:
  deploy:
    needs: build                       # Wait for build job
    runs-on: ubuntu-latest
    steps:
      - name: Download Build Artifact
        uses: actions/download-artifact@v4
        with:
          name: build-output           # Must match upload name
```

---

## Outputs

Besides Artifacts, Steps can produce and share **simple values** (strings, numbers).

### Step Outputs

```yaml
steps:
  - name: Set Output Value
    id: my-step
    run: echo "version=1.2.0" >> $GITHUB_OUTPUT

  - name: Use Output Value
    run: echo "The version is ${{ steps.my-step.outputs.version }}"
```

### Job Outputs

Jobs can pick up and share Step outputs via the **`steps` context**. Other jobs can use Job outputs via the **`needs` context**.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.get-version.outputs.version }}    # Expose to other jobs

    steps:
      - name: Get Version
        id: get-version
        run: echo "version=2.0.0" >> $GITHUB_OUTPUT

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Use Version from Build
        run: echo "Deploying version ${{ needs.build.outputs.version }}"
```

---

## Caching

Caching helps **speed up repeated, slow Steps** (e.g., installing dependencies).

### Why Cache?

- Avoid re-downloading dependencies on every run
- Significantly reduces workflow execution time
- Any files and folders can be cached

### Using the Cache Action

```yaml
steps:
  - name: Cache Node Modules
    uses: actions/cache@v4
    with:
      path: ~/.npm                          # Path to cache
      key: npm-deps-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        npm-deps-

  - name: Install Dependencies
    run: npm ci
```

### How It Works

1. Cache Action checks if a cache exists for the given **key**
2. If found → **restores** the cached files (skip slow step)
3. If not found → Step runs normally
4. After workflow completes → **automatically stores/updates** the cache

> **Important:** Don't use caching for Artifacts! Caching is for speeding up workflows, Artifacts are for sharing/preserving output files.

---

## Environment Variables

Dynamic values used in code that may differ from workflow to workflow.

### Defining Environment Variables

Can be defined at **three levels**:

**Workflow Level (available to all jobs):**

```yaml
name: CI

env:
  NODE_ENV: production
  APP_NAME: my-app

on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "${{ env.APP_NAME }}"
```

**Job Level (available to all steps in that job):**

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      DATABASE_NAME: test_db
    steps:
      - run: echo "$DATABASE_NAME"
```

**Step Level (available only to that step):**

```yaml
steps:
  - name: Run Script
    env:
      API_URL: https://api.example.com
    run: echo "$API_URL"
```

### Accessing Environment Variables

```yaml
# Using interpolation (GitHub Actions expression)
run: echo "${{ env.MY_VAR }}"

# Using shell syntax (in run commands)
run: echo "$MY_VAR"
```

---

## Secrets

Some dynamic values should **never be exposed** anywhere (logs, code, etc.).

### What Are Secrets?

- Database credentials, API keys, tokens, passwords, etc.
- Stored **encrypted** and masked in logs

### Where to Store Secrets

| Level | Scope |
|-------|-------|
| **Repository-level** | Available to all workflows in that repo |
| **Environment-level** | Available only to jobs referencing that environment |
| **Organization-level** | Shared across multiple repositories |

### Setting Secrets

1. Go to your repository on GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `Name` and `Value`

### Using Secrets in Workflows

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Server
        env:
          SSH_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          API_TOKEN: ${{ secrets.API_TOKEN }}
        run: |
          echo "Deploying with token..."
          # secrets are automatically masked in logs
```

> **Note:** Secrets are accessed via the **`secrets` context object** — `${{ secrets.SECRET_NAME }}`

---

## GitHub Actions Environments

Environments let you configure **protection rules** and **environment-specific variables/secrets**.

### What Are Environments?

- Jobs can reference different GitHub Actions **Environments** (e.g., `staging`, `production`)
- Environments allow you to set up **extra protection rules**
- You can store **Secrets on Environment-level** (separate from repo secrets)

### Setting Up Environments

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Configure protection rules:
   - **Required reviewers** — someone must approve before the job runs
   - **Wait timer** — delay before the job starts
   - **Deployment branches** — restrict which branches can deploy

### Using Environments in Workflows

```yaml
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging               # Reference environment
    steps:
      - name: Deploy
        run: echo "Deploying to staging"
        env:
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}    # Environment-level secret

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production            # Different environment with stricter rules
    steps:
      - name: Deploy
        run: echo "Deploying to production"
```

---

## Quick Reference — Workflow Syntax

```yaml
name: <workflow-name>          # Optional: Display name

on:                            # Required: Event trigger(s)
  <event>:
    types: [<activity-types>]
    branches: [<branch-filter>]
    paths: [<path-filter>]

env:                           # Optional: Workflow-level env vars
  KEY: value

jobs:                          # Required: One or more jobs
  <job-id>:
    runs-on: <runner>          # Required: Runner
    needs: [<job-ids>]         # Optional: Job dependencies
    if: <condition>            # Optional: Conditional execution
    environment: <env-name>    # Optional: GitHub environment

    env:                       # Optional: Job-level env vars
      KEY: value

    outputs:                   # Optional: Job outputs
      <output-name>: ${{ steps.<step-id>.outputs.<name> }}

    steps:                     # Required: One or more steps
      - name: <step-name>     # Optional: Display name
        id: <step-id>         # Optional: Reference ID
        uses: <action>        # Use an Action
        with:                  # Action inputs
          <key>: <value>

      - name: <step-name>
        run: <shell-command>   # Run shell command
        env:                   # Step-level env vars
          KEY: value
```

---

> **Part 2 coming soon** — will cover advanced topics like matrix strategies, reusable workflows, conditional logic, concurrency, and more.
