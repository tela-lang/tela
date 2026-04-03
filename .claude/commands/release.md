Release a new version of tela to GitHub and npm.

Takes a version string as `$ARGUMENTS` (e.g. `0.3.0`). Runs all three jobs in order:

## 1. Bump version

Update `package.json`:
- Set `"version"` to `$ARGUMENTS`

## 2. Update docs version strings

These files contain hard-coded version strings that must be updated to match the new version:

- `docs/components/App.tela` — line with `content: "v…"` inside the badge span → set to `"v$ARGUMENTS"`
- `docs/components/App.js` — same string in the compiled JS → set to `"v$ARGUMENTS"`
- `docs/components/LanguageSpec.tela` — line with `content: "Tela v…"` → set to `"Tela vMAJOR.MINOR"` (drop the patch segment, e.g. `0.3.0` → `v0.3`)
- `docs/components/LanguageSpec.js` — same string in the compiled JS → same `"Tela vMAJOR.MINOR"` value

Read each file before editing it.

## 3. Commit, tag, push, and publish

Run these steps in order:

1. Stage all modified files:
   ```
   git add package.json docs/components/App.tela docs/components/App.js docs/components/LanguageSpec.tela docs/components/LanguageSpec.js
   ```
   Also stage any other already-modified tracked files the user had pending (run `git status` first to see them):
   ```
   git add -u
   ```

2. Show the user the staged diff (`git diff --cached --stat`) and the draft commit message below, and ask for confirmation before committing.

   Draft commit message:
   ```
   chore: release v$ARGUMENTS
   ```

3. After confirmation, commit:
   ```
   git commit -m "chore: release v$ARGUMENTS"
   ```

4. Create an annotated tag:
   ```
   git tag -a "v$ARGUMENTS" -m "v$ARGUMENTS"
   ```

5. Push branch and tag:
   ```
   git push origin main
   git push origin "v$ARGUMENTS"
   ```

6. Create a GitHub release:
   ```
   gh release create "v$ARGUMENTS" --title "v$ARGUMENTS" --generate-notes
   ```

7. Publish to npm:
   ```
   npm publish --access public
   ```

8. Confirm success by printing the npm package URL:
   `https://www.npmjs.com/package/@tela-lang/tela`
