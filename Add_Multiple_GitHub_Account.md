# How to Add Multiple GitHub Accounts on One System

This guide will walk you through the steps to set up multiple GitHub accounts on a single system using SSH keys.

## Step 1: Generate a New SSH Key for Your Second GitHub Account
Same ssh key can't be use in two github account, we need to generate the secound ssh key.

Open a terminal and run the following command. Replace `your_email@example.com` with your email address:

```sh
ssh-keygen -t ed25519 -C "your_email@example.com"
```

When prompted to "Enter a file in which to save the key," specify a different name for the key file (e.g., `id_ed25519_company`).

## Step 2: Add the New SSH Key to Your SSH Agent

Start the SSH agent (use git bash if not work on cmd):

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

```sh name=~/.ssh/config
# GitHub personal account
Host github.com-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519

# GitHub company account
Host github.com-company
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_company
```
Adding host in config is important.

## Step 5: Push the Repository Using the Correct SSH Host
Change the repo name accordingly.
```sh
git push git@github.com-company:mazkar69/AzKaaRNotes.git
```


That's it, We had successfully added the ssh for secound github account.
