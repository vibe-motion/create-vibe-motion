// 单独成文件是为了让 Node 原生 ESM 的脚本（scripts/*.mjs）能读到它：
// project.js 会间接引入 Scene.jsx，而 Node 无法加载 .jsx 扩展名。
export const ACTIVE_COMPOSITION_ID = "Motion30fps";
