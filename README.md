# create-vibe-motion

Initialize a Vibe Motion Remotion scaffold project.

## Usage

```bash
npm create vibe-motion@latest my-app
cd my-app
pnpm dev
```

Dependencies are installed automatically after scaffolding (pnpm preferred, falls back to npm).

If no directory is provided, it creates `./vibe-motion-app` by default.

On macOS, install triggers a shared Chrome Headless Shell check/install for Remotion and stores it under:

`~/Library/Caches/com.zjucat.create-vive-motion/remotion`

### Options

- `--force`: overwrite files when the target directory is not empty.
- `--skip-install`: skip automatic dependency installation.

## Repository Structure

This is a pnpm monorepo with two packages:

```
packages/
  create-vibe-motion/   # CLI package (published to npm, zero dependencies)
  template/             # Template files + dev environment (private, not published)
scripts/
  sync-template-to-cli.mjs   # copies template into CLI package before publish
```

### Where Template Content Comes From

- Files copied by the CLI are controlled by `packages/template/scaffold-manifest.json`.
- Generated `package.json`: `packages/template/scaffold-template-package.json`.
- Generated `.gitignore`: `packages/template/scaffold-template-gitignore`.

When adding or removing scaffold files, update `scaffold-manifest.json` first.

## Development

```bash
pnpm install              # install all dependencies
pnpm dev                  # run preview + Remotion studio
pnpm lint                 # lint template code
pnpm run sync-template    # sync template files into CLI package
pnpm run create:local     # test scaffold generation locally
```

### Validate a Generated App

```bash
pnpm run create:local -- /tmp/vibe-motion-test-app
cd /tmp/vibe-motion-test-app
pnpm dev
```

### Common Commands

```bash
# package dry-run (from CLI package)
cd packages/create-vibe-motion && pnpm pack --dry-run

# check published version
npm view create-vibe-motion version

# run scaffold CLI directly
node packages/create-vibe-motion/bin/create-vibe-motion.mjs my-app
```

## Release

1. Bump version:
   ```bash
   cd packages/create-vibe-motion
   pnpm version patch   # or minor / major
   ```
2. Commit and push:
   ```bash
   cd ../..
   git add .
   git commit -m "X.Y.Z"
   git push origin main
   git push origin vX.Y.Z
   ```
3. GitHub Actions publishes automatically to npm (Trusted Publishing via `.github/workflows/publish.yml`).

## Security / Dependency Policy

- Avoid `pnpm audit fix` in template without manual verification.
- Prefer pinning known-good versions when upstream has temporary advisories.
- After dependency updates, always validate by generating a fresh app and running `pnpm install && pnpm audit`.

## Remotion Note

Remotion may render frames out of order and in parallel. Scene animation logic should be frame-deterministic and independently computable per frame.
