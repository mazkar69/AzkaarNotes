# Git Commands Cheatsheet

> Last Updated: February 22, 2026

## Table of Contents
- [Configuration](#configuration)
- [Repository Setup](#repository-setup)
- [Staging and Commits](#staging-and-commits)
- [Branching](#branching)
- [Merging and Rebasing](#merging-and-rebasing)
- [Stashing](#stashing)
- [Remote Operations](#remote-operations)
- [Undoing Changes](#undoing-changes)
- [Log and History](#log-and-history)
- [Tags](#tags)
- [Cherry Pick](#cherry-pick)
- [Useful Shortcuts](#useful-shortcuts)

---

## Configuration

```bash
# Set global username and email
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# List all config
git config --list

# Set default branch name
git config --global init.defaultBranch main

# Set default editor
git config --global core.editor "code --wait"

# Enable colored output
git config --global color.ui auto
```

---

## Repository Setup

```bash
# Initialize a new repository
git init

# Clone a repository
git clone <repo-url>

# Clone a specific branch
git clone -b <branch-name> <repo-url>

# Clone with shallow history (faster)
git clone --depth 1 <repo-url>
```

---

## Staging and Commits

```bash
# Check status
git status

# Add specific file
git add <file>

# Add all changes
git add .

# Add changes interactively (select hunks)
git add -p

# Commit with message
git commit -m "commit message"

# Add and commit tracked files in one step
git commit -am "commit message"

# Amend last commit (change message or add files)
git commit --amend -m "updated message"

# Amend without changing the message
git commit --amend --no-edit

# Empty commit (useful for triggering CI)
git commit --allow-empty -m "trigger build"
```

---

## Branching

```bash
# List all local branches
git branch

# List all branches (local + remote)
git branch -a

# Create a new branch
git branch <branch-name>

# Create and switch to branch
git checkout -b <branch-name>
# OR (newer syntax)
git switch -c <branch-name>

# Switch to existing branch
git checkout <branch-name>
# OR
git switch <branch-name>

# Delete a local branch
git branch -d <branch-name>

# Force delete (unmerged branch)
git branch -D <branch-name>

# Delete a remote branch
git push origin --delete <branch-name>

# Rename current branch
git branch -m <new-name>
```

---

## Merging and Rebasing

```bash
# Merge branch into current branch
git merge <branch-name>

# Merge without fast-forward (keeps merge commit)
git merge --no-ff <branch-name>

# Abort a merge
git merge --abort

# Rebase current branch onto another
git rebase <branch-name>

# Interactive rebase (squash, reorder, edit commits)
git rebase -i HEAD~<n>

# Abort a rebase
git rebase --abort

# Continue rebase after resolving conflicts
git rebase --continue
```

---

## Stashing

```bash
# Stash current changes
git stash

# Stash with a message
git stash save "work in progress"

# List all stashes
git stash list

# Apply latest stash (keep in stash list)
git stash apply

# Apply and remove latest stash
git stash pop

# Apply a specific stash
git stash apply stash@{2}

# Drop a specific stash
git stash drop stash@{0}

# Clear all stashes
git stash clear

# Stash including untracked files
git stash -u
```

---

## Remote Operations

```bash
# List remotes
git remote -v

# Add remote
git remote add origin <repo-url>

# Change remote URL
git remote set-url origin <new-url>

# Fetch from remote (does not merge)
git fetch origin

# Pull (fetch + merge)
git pull origin <branch>

# Pull with rebase instead of merge
git pull --rebase origin <branch>

# Push to remote
git push origin <branch>

# Push and set upstream
git push -u origin <branch>

# Force push (use with caution)
git push --force-with-lease origin <branch>
```

---

## Undoing Changes

```bash
# Discard changes in a file (unstaged)
git checkout -- <file>
# OR
git restore <file>

# Unstage a file (keep changes)
git reset HEAD <file>
# OR
git restore --staged <file>

# Undo last commit (keep changes staged)
git reset --soft HEAD~1

# Undo last commit (keep changes unstaged)
git reset --mixed HEAD~1

# Undo last commit (discard changes completely)
git reset --hard HEAD~1

# Revert a commit (creates a new commit)
git revert <commit-hash>

# Clean untracked files
git clean -fd

# Preview what clean would remove
git clean -fd --dry-run
```

---

## Log and History

```bash
# View commit log
git log

# Compact log (one line per commit)
git log --oneline

# Graph view
git log --oneline --graph --all

# Show last n commits
git log -n 5

# Log with file changes
git log --stat

# Show changes in a commit
git show <commit-hash>

# Show who changed each line
git blame <file>

# Search commit messages
git log --grep="search term"

# Show diff between branches
git diff <branch1>..<branch2>

# Show diff of staged files
git diff --staged
```

---

## Tags

```bash
# List tags
git tag

# Create lightweight tag
git tag <tag-name>

# Create annotated tag
git tag -a v1.0.0 -m "version 1.0.0"

# Tag a specific commit
git tag -a v1.0.0 <commit-hash> -m "message"

# Push a tag to remote
git push origin <tag-name>

# Push all tags
git push origin --tags

# Delete local tag
git tag -d <tag-name>

# Delete remote tag
git push origin --delete <tag-name>
```

---

## Cherry Pick

```bash
# Apply a specific commit to current branch
git cherry-pick <commit-hash>

# Cherry-pick without committing
git cherry-pick --no-commit <commit-hash>

# Abort cherry-pick
git cherry-pick --abort
```

---

## Useful Shortcuts

```bash
# See which files were changed in last commit
git diff --name-only HEAD~1

# Count commits by author
git shortlog -s -n

# Find a deleted file in history
git log --all --full-history -- <file-path>

# Export a branch as archive
git archive --format=zip HEAD -o latest.zip

# Check if branch contains a commit
git branch --contains <commit-hash>

# Show remote tracking branches
git branch -vv
```
