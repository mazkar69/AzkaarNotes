# Git Workflow and Branching Strategy

> Last Updated: February 22, 2026

## Table of Contents
- [GitFlow Workflow](#gitflow-workflow)
- [Branch Naming Convention](#branch-naming-convention)
- [Feature Branch Workflow](#feature-branch-workflow)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Workflow](#pull-request-workflow)
- [Release Process](#release-process)
- [Hotfix Process](#hotfix-process)

---

## GitFlow Workflow

```
main (production)
  |
  |--- develop (integration)
  |       |
  |       |--- feature/user-auth
  |       |--- feature/payment-gateway
  |       |--- feature/dashboard-ui
  |       |
  |       |--- release/v1.2.0
  |
  |--- hotfix/critical-bug-fix
```

### Branch Types

| Branch | Purpose | Created From | Merges Into |
|--------|---------|-------------|-------------|
| `main` | Production-ready code | - | - |
| `develop` | Integration branch for features | `main` | `main` (via release) |
| `feature/*` | New feature development | `develop` | `develop` |
| `release/*` | Prepare for production release | `develop` | `main` and `develop` |
| `hotfix/*` | Fix critical production bugs | `main` | `main` and `develop` |

---

## Branch Naming Convention

```
Format: <type>/<short-description>

Examples:
  feature/user-authentication
  feature/add-payment-gateway
  bugfix/login-redirect-issue
  hotfix/fix-crash-on-upload
  release/v1.2.0
  chore/update-dependencies
  refactor/clean-up-api-routes
```

### Rules
- Use lowercase
- Use hyphens to separate words
- Keep it short but descriptive
- Include ticket/issue number if applicable: `feature/PROJ-123-user-auth`

---

## Feature Branch Workflow

### Step 1 - Create Feature Branch

```bash
# Make sure develop is up to date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name
```

### Step 2 - Work on Feature

```bash
# Make changes, stage, and commit
git add .
git commit -m "feat: add user registration form"

# Push feature branch to remote
git push -u origin feature/your-feature-name
```

### Step 3 - Keep Branch Updated

```bash
# Regularly pull changes from develop
git checkout develop
git pull origin develop
git checkout feature/your-feature-name
git merge develop
# OR rebase
git rebase develop
```

### Step 4 - Create Pull Request

```bash
# Push final changes
git push origin feature/your-feature-name
# Create PR on GitHub/GitLab: feature/your-feature-name -> develop
```

### Step 5 - After Merge, Clean Up

```bash
# Delete local branch
git branch -d feature/your-feature-name

# Delete remote branch
git push origin --delete feature/your-feature-name
```

---

## Commit Message Convention

### Format

```
<type>(<scope>): <short description>

<optional body>

<optional footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code refactoring (no feature or fix) |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, config |
| `ci` | CI/CD configuration changes |
| `revert` | Revert a previous commit |

### Examples

```
feat(auth): add JWT token refresh endpoint
fix(api): resolve null pointer in user query
docs(readme): update installation instructions
chore(deps): upgrade express to v5.0
refactor(utils): simplify date formatting logic
```

---

## Pull Request Workflow

### Before Creating PR

```bash
# Ensure branch is up to date with develop
git checkout develop
git pull origin develop
git checkout feature/your-feature
git rebase develop

# Run tests and linting
npm test
npm run lint
```

### PR Checklist

- Branch is up to date with target branch
- All tests pass
- Code follows project conventions
- Self-review completed
- Meaningful title and description
- Linked related issues

### PR Title Format

```
feat: add user profile page
fix: resolve cart total calculation
docs: update API endpoint documentation
```

---

## Release Process

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Update version numbers, changelog, etc.
# Test thoroughly

# Merge into main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# Merge back into develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# Clean up
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

---

## Hotfix Process

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-bug

# Fix the bug, commit
git commit -m "fix: resolve payment processing crash"

# Merge into main
git checkout main
git merge --no-ff hotfix/fix-critical-bug
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin main --tags

# Merge into develop
git checkout develop
git merge --no-ff hotfix/fix-critical-bug
git push origin develop

# Clean up
git branch -d hotfix/fix-critical-bug
git push origin --delete hotfix/fix-critical-bug
```
