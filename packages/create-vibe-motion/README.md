# create-vibe-motion

快速创建一个可运行的 Vibe Motion（Remotion）模板项目。

## 新建模板

推荐使用：

```bash
npx create-vibe-motion@latest my-app
```

如果希望连 `npx` 拉取脚手架包本身也走镜像，可这样执行：

```bash
npm_config_registry=https://registry.npmmirror.com npx create-vibe-motion@latest my-app
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
pnpm install --registry=https://registry.npmmirror.com
pnpm dev
```

### 4) 指定安装源

```bash
npx create-vibe-motion@latest my-app --registry=https://registry.npmmirror.com
```

## CLI 参数

- `--force`, `-f`：目标目录非空时强制覆盖。
- `--skip-install`：跳过自动安装依赖。
- `--registry`：指定依赖安装使用的 registry，例如 `https://registry.npmmirror.com`。

## 环境要求

- Node.js `>= 18.18.0`

## 行为说明

- 脚手架会自动写入项目的 `package.json` 和 `.gitignore`。
- 脚手架安装依赖时只使用 `pnpm`。
- 若机器未安装 `pnpm`，会先尝试使用 `npm` 自动安装 `pnpm`，再继续 `pnpm install`。
- 默认安装源为 `https://registry.npmmirror.com`，若已配置 `npm_config_registry` 或传入 `--registry`，则按该值安装。
