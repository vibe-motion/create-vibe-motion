import { spawnSync } from "node:child_process";

const EDGEONE_DEFAULT_PAGES_ID = "pages-nyysufr8rhgo";
const EDGEONE_DEFAULT_FROM = "deployments";
const DEFAULT_BROWSER_APP = "Google Chrome";

const resolveUploadUrl = () => {
  const customUrl = process.env.EDGEONE_PAGES_UPLOAD_URL;
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl.trim();
  }

  const pagesId = (
    process.env.EDGEONE_PAGES_PROJECT_ID || EDGEONE_DEFAULT_PAGES_ID
  ).trim();
  const from = (process.env.EDGEONE_PAGES_FROM || EDGEONE_DEFAULT_FROM).trim();
  const safeFrom = from.length > 0 ? from : EDGEONE_DEFAULT_FROM;

  return `https://console.cloud.tencent.com/edgeone/pages/upload/${pagesId}?from=${safeFrom}`;
};

const openByPlatform = (url) => {
  if (process.platform === "darwin") {
    const browserApp = process.env.EDGEONE_BROWSER_APP;
    const hasBrowserApp =
      typeof browserApp === "string" && browserApp.trim().length > 0;
    const args = hasBrowserApp
      ? ["-a", browserApp.trim(), url]
      : ["-a", DEFAULT_BROWSER_APP, url];

    return spawnSync("open", args, { stdio: "inherit" });
  }

  if (process.platform === "win32") {
    return spawnSync("cmd", ["/c", "start", "", url], { stdio: "inherit" });
  }

  return spawnSync("xdg-open", [url], { stdio: "inherit" });
};

const url = resolveUploadUrl();
console.log(`[EdgeOne] opening upload page: ${url}`);
const shouldOpen = process.env.EDGEONE_OPEN !== "0";

if (!shouldOpen) {
  console.log("[EdgeOne] EDGEONE_OPEN=0, skip opening browser.");
  process.exit(0);
}

const result = openByPlatform(url);

if (result.error) {
  console.error(`[EdgeOne] failed to open URL: ${result.error.message}`);
  process.exit(1);
}

if (typeof result.status === "number" && result.status !== 0) {
  process.exit(result.status);
}
