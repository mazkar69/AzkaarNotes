# How to Add Multiple GitHub Accounts on One System

This guide will walk you through the steps to set up multiple GitHub accounts on a single system using SSH keys.

## Step 1: Generate a New SSH Key for Your Second GitHub Account

Open a terminal and run the following command. Replace `your_email@example.com` with your email address:

```sh
ssh-keygen -t ed25519 -C "your_email@example.com"
```

When prompted to "Enter a file in which to save the key," specify a different name for the key file (e.g., `id_ed25519_personal`).


### 1.1 Generate SSH Keys for Personal and Company Accounts 
Note: One SSH key is for your personal GitHub account and the other is for your company GitHub account.

Generate SSH keys for your personal and company accounts:
```bash
ssh-keygen -t ed25519 -C "your_personal_email@example.com" -f ~/.ssh/id_ed25519_personal
ssh-keygen -t ed25519 -C "your_company_email@example.com" -f ~/.ssh/id_ed25519_company
```
Replace the email addresses with your personal and company GitHub email addresses.

## Step 2: Add the New SSH Key to Your SSH Agent

Start the SSH agent:

```sh
eval "$(ssh-agent -s)"
```

Add your SSH private key to the SSH agent:

```sh
ssh-add ~/.ssh/id_ed25519_company
```

## Step 3: Add the New SSH Key to Your GitHub Account

Copy the SSH key to your clipboard:

```sh
cat ~/.ssh/id_ed25519_company.pub
```

Then, add this key to your GitHub account by going to **Settings** > **SSH and GPG keys** > **New SSH key**.

## Step 4: Create or Edit the SSH Configuration File

Edit the `~/.ssh/config` file to differentiate between your GitHub accounts:

```sh
# GitHub personal account
Host github.com-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal 

# GitHub company account
Host github.com-company
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_company   
```

## Step 5: Cloning and Pushing Repositories Using Different Accounts

When cloning repositories, use the correct host alias:

For the personal account:
```sh
git clone git@github.com-personal:username/repository.git
```

For the company account:
```sh
git clone git@github.com-company:company_username/repository.git
```

If you have an existing repository, update the remote URL:

```sh
git remote set-url origin git@github.com-company:company_username/repository.git
```

## Fix: Permission Denied Issue When Pushing to GitHub

If you encounter an error like:

```
ERROR: Permission to mazkar69/AzkaarNotes.git denied to mdazkaar.
fatal: Could not read from remote repository.
```

### Step 1: Check Which SSH Key Git is Using

Run:
```sh
ssh -T git@github.com
```

If it returns:
```sh
Hi mdazkaar! You've successfully authenticated...
```
But you are trying to push to `mazkar69/AzkaarNotes.git`, then Git is using the wrong account.

### Step 2: Verify Your Remote URL

Run:
```sh
git remote -v
```

If you see:
```
origin  git@github.com:mazkar69/AzkaarNotes.git (fetch)
origin  git@github.com:mazkar69/AzkaarNotes.git (push)
```
Git is using the default `github.com`, which does not respect your SSH configuration.

### Step 3: Update Remote URL with Correct SSH Host

If pushing from Account 1 (`mazkar69`):
```sh
git remote set-url origin git@github.com-personal:mazkar69/AzkaarNotes.git
```

If pushing from Account 2 (`mdazkaar`):
```sh
git remote set-url origin git@github.com-company:mdazkaar/AzkaarNotes.git
```

### Step 4: Push Again

Try:
```sh
git push origin main
```

If the issue persists, force Git to use the correct SSH key:
```sh
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_company" git push origin main
```

### Step 5: Verify SSH Authentication

Run:
```sh
ssh -i ~/.ssh/id_ed25519_company -T git@github.com
```

If one fails, you might need to **re-add your SSH key to GitHub**.

## Conclusion
By following these steps, you can seamlessly switch between multiple GitHub accounts on the same system without running into authentication errors.

