# Getting Set Up to Work on HouseLens

Hey Zach — this guide walks you through everything you need to work on HouseLens on your own computer, so we can build on it independently without needing to be in the same room.

**Total setup time:** About 30–45 minutes.

**The first step is getting Claude set up.** Claude is the AI that's been building this entire app — Jonathan doesn't write any code himself, he just describes what he wants and Claude builds it. Once you have Claude, you can ask it for help with every other step in this guide. If anything below is confusing, just ask Claude and it'll walk you through it.

---

## Step 1: Sign Up for Claude

1. Go to [claude.ai](https://claude.ai) and create an account with your email
2. You'll start on the free tier — to use Claude Code (the coding tool), you need to subscribe to one of these plans:
   - **Claude Pro** — $20/month. Enough to get started.
   - **Claude Max** — $100/month. More usage if you find yourself hitting limits.
3. Once subscribed, download the **Claude desktop app** for your Mac:
   - Go to [claude.ai/download](https://claude.ai/download) and install it
   - Or you can use the web version at [claude.ai/code](https://claude.ai/code) — no download needed

### What Claude Can Do

Claude is like having a developer sitting next to you. You can:

- Describe a feature you want and it writes all the code
- Paste in an error message and it fixes the problem
- Ask it to explain how something in the app works
- Tell it to commit and push your changes to GitHub
- Ask it to help you install tools, set up accounts, or run commands

You talk to it in plain English — no coding knowledge needed. This is exactly how Jonathan has been building the app.

### Getting Into Claude Code

Once you have the desktop app installed and you're logged in:

1. Open the Claude desktop app
2. Look for **Claude Code** — it's a coding-focused mode that can read and edit files on your computer
3. When it asks for a working directory, you'll eventually point it at your HouseLens folder (we'll set that up in the next steps)

**From this point on, if any step below is unclear, just ask Claude.** Paste in the step you're stuck on and say "can you help me with this?" — it'll know what to do.

---

## Step 2: Create a GitHub Account (free)

GitHub is where our code lives online. You need an account so Jonathan can give you access.

1. Go to [github.com](https://github.com) and click **Sign up**
2. Use whatever email you want — your personal one is fine
3. Pick a username and password
4. **Text Jonathan your GitHub username** so he can give you access to the HouseLens project

After Jonathan sends the invite, you'll get an email from GitHub — click **Accept invitation** in that email.

---

## Step 3: Install Developer Tools

You need a few free tools on your Mac. Open the **Terminal** app (search for "Terminal" in Spotlight — hit Cmd+Space and type "Terminal").

**If you'd rather have Claude walk you through this:** open Claude Code and tell it "I need to install Homebrew, Node.js, and Git on my Mac — can you help?" It'll guide you through each command.

Or follow along here — run these commands one at a time in Terminal:

### Install Homebrew (a Mac package manager)

Paste this into Terminal and press Enter:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

It'll ask for your Mac password (the one you use to log in). You won't see characters as you type — that's normal. Press Enter when done.

**Important:** When it finishes, it'll print a "Next steps" message with two commands to run. Copy and paste those into Terminal and run them — they add Homebrew to your path so it works going forward.

### Install Node.js and Git

```
brew install node git
```

### Install EAS CLI (for publishing updates to your phone)

```
npm install -g eas-cli
```

### Create an Expo account

1. Go to [expo.dev](https://expo.dev) and sign up (free)
2. Back in Terminal, run:
   ```
   eas login
   ```
3. Enter the Expo username and password you just created

---

## Step 4: Download the Project

In Terminal, run these commands:

```
cd ~/Documents
git clone https://github.com/Thejaeti/HouseLens.git
cd HouseLens
npm install
```

This downloads all the code and installs everything the app needs. It might take a few minutes.

---

## Step 5: Open the Project in Claude Code

Now that the project is on your computer, point Claude at it:

1. Open the Claude desktop app → Claude Code
2. Set the working directory to `Documents/HouseLens`
3. You're ready to go — Claude can now see all the project files

Try saying something like:

> "Hey, can you give me a quick overview of what this app does and how it's structured?"

Claude will read through the code and explain everything.

---

## Step 6: Test the App on Your Phone

Make sure you have **Expo Go** installed on your iPhone (free, from the App Store).

Then just tell Claude:

> "Start the Expo dev server with tunnel so I can test on my phone."

Claude will run the right command. When it's ready, you'll get a URL or QR code to open in Expo Go on your phone.

---

## Step 7: Making Changes and Sharing Your Work

This is the day-to-day workflow:

**When you sit down to work**, tell Claude:

> "Pull the latest changes from GitHub so I have Jonathan's most recent work."

**While working**, just describe what you want. For example:

> "Can you make the yard signs on the Drive tab a little bigger?"

> "The compass heading seems off by about 10 degrees — can you look into that?"

> "I have an idea for a new feature — when you tap a yard sign, it should show the Zillow listing photos."

**When you're done**, tell Claude:

> "Please commit and push my changes to GitHub."

That saves your work and makes it visible to Jonathan.

---

## Quick Reference

| Task | What to tell Claude |
|---|---|
| **Get latest changes** | "Pull the latest from GitHub" |
| **Test on your phone** | "Start the Expo dev server with tunnel" |
| **Build something** | Just describe what you want in plain English |
| **Save your work** | "Commit and push to GitHub" |
| **Fix a problem** | Paste the error and say "can you fix this?" |
| **Understand the code** | "Explain how [feature] works" |

---

## If Something Goes Wrong

Don't worry about breaking anything — Git keeps a full history of every change, so we can always undo things.

- **Ask Claude first** — it can usually fix whatever went wrong
- **Text Jonathan** — he's run into most of the same issues already
- **Worst case**, delete the HouseLens folder and redo Step 4 to get a fresh copy

---

## Summary

1. **Sign up for Claude** ($20/month) and download the desktop app — do this first, then Claude helps with everything else
2. **Sign up for GitHub** (free) and text Jonathan your username
3. **Install tools** (Homebrew, Node.js, Git) — ask Claude if you need help
4. **Download the project** from GitHub
5. **Open it in Claude Code** and start building

That's it. The day-to-day is: open Claude, pull latest, describe what you want, test it on your phone, push your changes.
