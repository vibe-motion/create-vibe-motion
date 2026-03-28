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
npm install
npm run dev
```

## Options

- `--force`: overwrite files when the target directory is not empty.

## Automated Publishing (GitHub Actions)

This repository includes a publish workflow at `.github/workflows/publish.yml`.

It publishes to npm when you push a tag that starts with `v` (for example `v0.1.1`).

### Release

```bash
npm version patch
git push origin main --follow-tags
```

## Handover

See [HANDOVER.md](./HANDOVER.md) for ongoing development and maintenance notes.
