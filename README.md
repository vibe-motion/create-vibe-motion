# create-vibe-motion

Initialize a Vibe Motion Remotion scaffold project.

## Usage

```bash
npm create vibe-motion@latest my-app
```

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

### Configure npm Trusted Publisher

On npm package settings (`create-vibe-motion`) -> `Trusted publishing`:

- Provider: `GitHub Actions`
- Organization or user: `vibe-motion`
- Repository: `create-vibe-motion`
- Workflow filename: `publish.yml`
- Environment name: leave empty unless you use GitHub Environments

### Release

```bash
npm version patch
git push origin main --follow-tags
```
