# Getting Set Up to Work on HouseLens

Hey Zach — this guide walks you through everything you need to work on HouseLens on your own computer, so we can build on it independently without needing to be in the same room.

**Total setup time:** About 30–45 minutes.

---

## Step 1: Create a GitHub Account (free)

GitHub is where our code lives. You need an account to access it.

1. Go to [github.com](https://github.com) and click **Sign up**
2. Use whatever email you want — your personal one is fine
3. Pick a username and password
4. **Once you're signed up, text Jonathan your GitHub username** so he can give you access to the HouseLens project

After Jonathan sends the invite, you'll get an email from GitHub — click **Accept invitation** in that email.

---

## Step 2: Sign Up for Claude (recommended)

Claude is the AI that's been building this app with Jonathan. Without it, you'd need to know how to code — with it, you just describe what you want and it writes the code for you.

1. Go to [claude.ai](https://claude.ai) and create an account
2. Subscribe to **Claude Pro** ($20/month) or **Claude Max** ($100/month — more usage)
   - Pro is enough to get started
3. Download the **Claude desktop app** for Mac from [claude.ai/download](https://claude.ai/download)
   - Or use the web version at [claude.ai/code](https://claude.ai/code)

---

## Step 3: Install Developer Tools

You need a few free tools on your Mac. Open the **Terminal** app (search for "Terminal" in Spotlight / Cmd+Space) and run these commands one at a time.

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

### Install EAS CLI (for publishing updates)

```
npm install -g eas-cli
```

### Create an Expo account

1. Go to [expo.dev](https://expo.dev) and sign up (free)
2. Back in Terminal, run:
   ```
   eas login
   ```
3. Enter the username and password you just created

---

## Step 4: Download the Project

In Terminal, decide where you want the project to live. Your Desktop or Documents folder works fine:

```
cd ~/Documents
git clone https://github.com/Thejaeti/HouseLens.git
cd HouseLens
npm install
```

This downloads all the code and installs the dependencies. It might take a few minutes.

---

## Step 5: Test It on Your Phone

Make sure you have **Expo Go** installed on your iPhone (free, from the App Store).

In Terminal, run:

```
npx expo start --tunnel
```

Wait about 30 seconds. A QR code should appear in Terminal. If it does, scan it with your iPhone camera — it'll open in Expo Go. If no QR code appears, look for a URL that starts with `exp://` and type it into Expo Go manually.

If everything works, you should see HouseLens on your phone.

Press **Ctrl+C** in Terminal to stop the server when you're done testing.

---

## Step 6: Working with Claude Code

This is the fun part — you tell Claude what to build, and it writes the code.

### Option A: Claude Desktop App

1. Open the Claude desktop app
2. You should see a **Claude Code** option — it's a coding-focused mode
3. When it asks for a working directory, navigate to your HouseLens folder (`Documents/HouseLens`)
4. Start describing what you want to build or change — Claude handles the rest

### Option B: Terminal (CLI)

If you prefer Terminal:

1. Install Claude Code:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
2. Navigate to the project and start it:
   ```
   cd ~/Documents/HouseLens
   claude
   ```
3. Claude opens in your Terminal — describe what you want, and it makes the changes

Either way, Claude can see all the project files and make changes directly.

---

## Step 7: Saving and Sharing Your Work

When you've made changes you're happy with, you need to "push" them to GitHub so Jonathan can see them too. You can ask Claude to do this for you — just say:

> "Please commit and push my changes to GitHub."

Claude will handle the Git commands.

**Before you start working each time**, tell Claude:

> "Pull the latest changes from GitHub."

This makes sure you have Jonathan's latest work before you start editing.

---

## Quick Reference

| Task | What to do |
|---|---|
| **Start working** | Open Terminal → `cd ~/Documents/HouseLens` → `claude` (or open Claude desktop app) |
| **Get latest changes** | Tell Claude: "Pull the latest from GitHub" |
| **Test on your phone** | Tell Claude: "Start the Expo dev server with tunnel" |
| **Save your work** | Tell Claude: "Commit and push to GitHub" |
| **Stop working** | Close Claude, or type `/exit` in Terminal |

---

## If Something Goes Wrong

Don't worry about breaking anything — Git keeps a full history of every change, so we can always undo things. If you run into trouble:

- Ask Claude for help — it can usually fix whatever went wrong
- Text Jonathan — he's run into most of the same issues already
- Worst case, you can always delete the folder and re-clone it fresh (Step 4)

---

## Summary

1. Sign up for GitHub (free) → text Jonathan your username
2. Sign up for Claude ($20/month) → download the desktop app
3. Install Homebrew, Node.js, and Git (free, one-time)
4. Clone the project from GitHub
5. Start Claude, point it at the project, and start building

That's it — once you're set up, the day-to-day is just: open Claude, pull latest, describe what you want, test it, push your changes.
