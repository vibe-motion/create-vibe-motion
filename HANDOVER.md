# Handover Notes

This document is for maintainers of `create-vibe-motion`.

## What This Repo Is

- npm package: `create-vibe-motion`
- purpose: scaffold generator for a Remotion-based project
- entry CLI: `bin/create-vibe-motion.mjs`
- publish workflow: `.github/workflows/publish.yml`

## Local Development

```bash
npm install
npm run lint
npm run create:local -- /tmp/vibe-motion-test-app
```

Then validate generated app:

```bash
cd /tmp/vibe-motion-test-app
npm install
npm run dev
```

## Release Process

1. Merge changes to `main`.
2. Bump version and create tag:
   `npm version patch` (or `minor` / `major`)
3. Push branch + tags:
   `git push origin main --follow-tags`
4. GitHub Actions publishes automatically to npm (Trusted Publishing).

## Where Template Content Comes From

- files copied by CLI are controlled by `scaffold-manifest.json`
- generated target `package.json` template: `scaffold-template-package.json`
- generated target `.gitignore` template: `scaffold-template-gitignore`

When adding/removing scaffold files, update `scaffold-manifest.json` first.

## Security / Dependency Policy

- avoid `npm audit fix --force` in template without manual verification
- prefer pinning known-good versions when upstream has temporary advisories
- after dependency updates, always validate by:
  - generating a fresh app
  - running `npm install`
  - running `npm audit`

## Remotion Note

Remotion may render frames out of order and in parallel. Scene animation logic should be frame-deterministic and independently computable per frame.

## Common Commands

```bash
# package dry run
npm pack --dry-run

# check package already published
npm view create-vibe-motion version

# run scaffold CLI directly
node bin/create-vibe-motion.mjs my-app
```
