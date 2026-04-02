# create-vibe-motion

快速创建一个可运行的 Vibe Motion（Remotion）模板项目。

## 新建模板

推荐使用：

```bash
npx create-vibe-motion@latest my-app
```

然后进入项目并启动：

```bash
cd my-app
pnpm dev
```

## 常用用法

### 1) 不传目录名

```bash
npx create-vibe-motion@latest
```

默认会创建 `./vibe-motion-app`。

### 2) 在当前目录初始化

```bash
npx create-vibe-motion@latest . --force
```

### 3) 只生成文件，跳过依赖安装

```bash
npx create-vibe-motion@latest my-app --skip-install
cd my-app
pnpm install
pnpm dev
```

## CLI 参数

- `--force`, `-f`：目标目录非空时强制覆盖。
- `--skip-install`：跳过自动安装依赖。

## 环境要求

- Node.js `>= 18.18.0`

## 行为说明

- 脚手架会自动写入项目的 `package.json` 和 `.gitignore`。
- 默认会自动安装依赖，优先使用 `pnpm`，没有 `pnpm` 时会回退到 `npm`。
