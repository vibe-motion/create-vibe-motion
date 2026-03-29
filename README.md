# create-vibe-motion

Initialize a Vibe Motion Remotion scaffold project.

## Usage

```bash
npm create vibe-motion@latest my-app
```

If no directory is provided, it creates `./vibe-motion-app` by default.

Then:

```bash
cd my-app
pnpm install   # recommended (shared store saves disk space)
pnpm dev
```

On macOS, `pnpm install` triggers a shared Chrome Headless Shell check/install for Remotion and stores it under:

`~/Library/Caches/com.zjucat.create-vive-motion/remotion`

## Options

- `--force`: overwrite files when the target directory is not empty.

## Repository Structure

This is a pnpm monorepo with two packages:

```
packages/
  create-vibe-motion/   # CLI package (published to npm, zero dependencies)
  template/             # Template files + dev environment (private, not published)
```

### Development

```bash
pnpm install              # install all dependencies
pnpm dev                  # run preview + Remotion studio
pnpm lint                 # lint template code
pnpm run sync-template    # sync template files into CLI package
pnpm run create:local     # test scaffold generation locally
```

## Automated Publishing (GitHub Actions)

The publish workflow at `.github/workflows/publish.yml` is triggered by pushing a `v*` tag or via manual dispatch.

It runs: `pnpm install` -> `lint` -> `sync-template` -> `pnpm publish` (from `packages/create-vibe-motion/`).

### Release

```bash
cd packages/create-vibe-motion
pnpm version patch        # bumps version in packages/create-vibe-motion/package.json
cd ../..
git add .
git commit -m "vX.Y.Z"
git tag vX.Y.Z
git push origin main --follow-tags
```
