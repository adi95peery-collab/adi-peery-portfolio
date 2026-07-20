---
name: save-changes-to-portfolio
description: Saves the user's work on this portfolio site to GitHub — plain-language summary of what changed, then commit and push to main. No branches, no PRs, no git jargon required from the user. Use this whenever the user wants to save, publish, upload, sync, or back up their work on this project — phrases like "save my changes", "push this", "put this on GitHub", "update the live site", "commit this", or even just "I'm done for now, save it" all mean this skill. Always use this instead of running raw git commands yourself when the user's intent is "I want my work saved/live" rather than a specific git operation.
---

# Save changes to portfolio

The user isn't fluent in git — that's the whole point of this skill. Never show
them raw command output or ask them to interpret a diff. Your job is to look at
the mess of files and commits, translate it into two or three plain sentences
about what changed, and only bother them with a single yes/no decision: does
this look right to save?

This project only ever uses one branch. There are no feature branches and no
pull requests here — every change goes straight to `main`, and `main` is what
GitHub Actions builds and deploys automatically. So the only two operations
this skill ever performs are `commit` and `push`. If you ever find yourself
about to run `git checkout -b`, `git branch <name>`, or `gh pr create` as part
of this flow, stop — that's not what this skill does.

## Steps

### 1. Make sure we're on `main`

```
git branch --show-current
```

If it's already `main`, move on.

If it's something else, check `git status --porcelain` on that branch first:
- **Clean** (no uncommitted changes): just `git checkout main`.
- **Dirty** (uncommitted changes sitting on the wrong branch): don't guess.
  Explain to the user in plain terms — "your work is currently sitting on a
  branch called `<name>` instead of `main`" — and ask how they want to handle
  it. Moving uncommitted work between branches can conflict or strand it, and
  that decision belongs to the user, not to you.

### 2. Check we're not behind the remote

```
git fetch origin main
git log HEAD..origin/main --oneline
```

If this prints any commits, GitHub has changes the user's local copy doesn't
(e.g. someone edited a file directly on GitHub.com). Don't try to merge or
rebase automatically — tell the user their local copy is behind and ask
whether they want you to pull those changes in first. Pushing over diverged
history is exactly the kind of thing that quietly loses work.

### 3. Gather everything that needs saving

Two separate things can need saving, and a given run might have either, both,
or neither:

- **Uncommitted changes** — `git status --porcelain` (also run `git diff` and
  `git diff --cached` to actually see what changed, not just which files).
- **Commits already made locally but not pushed** — `git log origin/main..HEAD --oneline`.

Before staging anything, glance over the file list from `git status` for
anything that looks like a secret or credential (`.env`, `*.key`, anything
with "secret", "credential", or "token" in the name). If you see one, flag it
to the user and leave it out rather than committing it silently.

### 4. Summarize in plain language

Read the diff, not just the filenames — "changed 3 files" tells the user
nothing. Translate what actually happened into a short, human sentence or two,
the way you'd describe it to a friend: which page or section changed, and
roughly what changed about it (new project added, image swapped, text edited,
spacing/layout tweak, bug fix, etc). Group related file changes together
instead of listing every path.

If there are also unpushed commits from earlier, mention those too (their
existing commit messages are usually enough to summarize — you don't need to
re-diff them).

Then draft a commit message: one short, present-tense line (e.g. "Update
Baby Boost hero image and fix mobile spacing on the about page"). No
conventional-commit prefixes or jargon — just a plain description a
non-technical person would recognize as accurate.

### 5. Show the summary and wait for a go-ahead

Present the plain-language summary plus the proposed commit message, then
stop and wait for the user to confirm. Don't commit or push until they say
something affirmative. If they want the message changed, adjust it and
confirm again — don't just proceed with your own judgment call once they've
pushed back once.

### 6. Commit and push

Once approved:

```
git add -A
git commit -m "<approved message>"
git push origin main
```

If there were only unpushed commits and nothing uncommitted, skip straight to
`git push origin main` — there's nothing new to commit.

If there was truly nothing uncommitted *and* nothing unpushed, don't run any
of this — just tell the user there's nothing new to save.

### 7. Confirm in plain language

Tell the user it's saved and pushed. This repo auto-deploys on every push to
`main` (see `.github/workflows/deploy.yml`), so mention that the live site at
https://adi95peery-collab.github.io/adi-peery-portfolio/ will update
automatically in under a minute — the user doesn't need to do anything else.
