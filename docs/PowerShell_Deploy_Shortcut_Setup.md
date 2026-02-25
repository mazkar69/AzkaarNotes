# 🚀 PowerShell Deploy Shortcut Setup (Windows)

This guide helps you create a shortcut command for your long SCP deploy
command.

------------------------------------------------------------------------

## ✅ Step 1: Check PowerShell Profile Path

Open PowerShell and run:

``` powershell
$PROFILE
```

This will show your profile file path.

------------------------------------------------------------------------

## ✅ Step 2: Create Profile File (If Not Exists)

``` powershell
Test-Path $PROFILE
```

If it returns `False`, create it:

``` powershell
New-Item -ItemType File -Path $PROFILE -Force
```

------------------------------------------------------------------------

## ✅ Step 3: Open Profile File

``` powershell
notepad $PROFILE
```

Add this function inside the file:

``` powershell
function deploy-numero {
    scp -i "C:\Users\Azkar\Desktop\AWS Connect\CNPL.pem" -r "G:\Ultimate Numerology App\numerology-web\dist" ubuntu@ec2-65-0-19-52.ap-south-1.compute.amazonaws.com:/home/ubuntu/
}
```

Save and close.

------------------------------------------------------------------------

## ✅ Step 4: Fix Execution Policy (If Needed)

Check policy:

``` powershell
Get-ExecutionPolicy
```

If it says `Restricted`, run:

``` powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Press `Y` to confirm.

------------------------------------------------------------------------

## ✅ Step 5: Reload Profile

Instead of restarting PowerShell:

``` powershell
. $PROFILE
```

(Note: dot + space before \$PROFILE)

------------------------------------------------------------------------

## ✅ Step 6: Run Your Shortcut

``` powershell
deploy-numero
```

------------------------------------------------------------------------

## 🔥 Optional: Create Shorter Alias

Add this line inside profile:

``` powershell
Set-Alias deploy deploy-numero
```

Reload profile again:

``` powershell
. $PROFILE
```

Now you can simply run:

``` powershell
deploy
```

------------------------------------------------------------------------

# 🎯 Done!

Now you have a reusable deploy shortcut in PowerShell.
