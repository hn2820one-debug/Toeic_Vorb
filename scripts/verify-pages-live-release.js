const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const repoRoot = rootFromArgs();
const softFail = process.argv.includes("--soft");
const errors = [];

function rootFromArgs() {
  const index = process.argv.indexOf("--root");
  if (index >= 0 && process.argv[index + 1]) {
    return path.resolve(process.argv[index + 1]);
  }
  return path.resolve(__dirname, "..");
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return "";
}

function filePath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(filePath(relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeBaseUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.endsWith("/") ? text : `${text}/`;
}

function derivePagesUrl() {
  const explicit = normalizeBaseUrl(argValue("--url") || process.env.PAGES_URL);
  if (explicit) return explicit;

  let remoteUrl = "";
  try {
    remoteUrl = execSync("git remote get-url origin", {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "ignore"]
    }).toString().trim();
  } catch (_error) {
    errors.push("Unable to resolve git remote origin; use --url or PAGES_URL.");
    return "";
  }

  const httpsMatch = remoteUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/i);
  const sshMatch = remoteUrl.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
  const match = httpsMatch || sshMatch;

  if (!match) {
    errors.push(`Unsupported git remote origin format: ${remoteUrl}`);
    return "";
  }

  const owner = match[1];
  const repo = match[2];
  const userPagesRepo = `${owner}.github.io`;
  const url = repo.toLowerCase() === userPagesRepo.toLowerCase()
    ? `https://${owner}.github.io/`
    : `https://${owner}.github.io/${repo}/`;

  return normalizeBaseUrl(url);
}

function extractLocalLauncherNote() {
  const text = readText("index.html");
  const match = text.match(/目前正式內容：[^<\n]+/);
  if (!match) {
    errors.push("index.html: missing launcher status note");
    return "";
  }
  return match[0].trim();
}

function extractConstFromText(text, name, label) {
  const match = String(text).match(new RegExp(`const\\s+${escapeRegExp(name)}\\s*=\\s*["']([^"']+)["']`));
  if (!match) {
    errors.push(`${label}: missing const ${name}`);
    return "";
  }
  return match[1];
}

function extractRemoteLauncherNote(html) {
  const match = String(html).match(/目前[^<\n]+/);
  return match ? match[0].trim() : "";
}

async function fetchText(url, label) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "cache-control": "no-cache"
      }
    });
    if (!response.ok) {
      errors.push(`${label}: expected HTTP 200, found ${response.status}`);
      return "";
    }
    return await response.text();
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
    return "";
  }
}

function expectEqual(label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: expected ${expected}, found ${actual}`);
  }
}

async function main() {
  const baseUrl = derivePagesUrl();
  if (!baseUrl) {
    finish();
    return;
  }

  const localManifest = readJson("manifest.json");
  const localCurriculum = readJson(path.join("data", "vocab", "curriculum.json"));
  const expected = {
    baseUrl,
    seedVersion: localCurriculum.seed_version,
    runnableLessons: String((localCurriculum.lessons || []).length),
    questionFiles: String((localCurriculum.question_files || []).length),
    manifestStartUrl: localManifest.start_url,
    manifestScope: localManifest.scope,
    manifestDisplay: localManifest.display,
    cacheName: extractConstFromText(readText("sw.js"), "CACHE_NAME", "sw.js"),
    launcherNote: extractLocalLauncherNote()
  };

  const [indexText, manifestText, curriculumText, swText] = await Promise.all([
    fetchText(baseUrl, "live launcher"),
    fetchText(new URL("manifest.json", baseUrl).toString(), "live manifest"),
    fetchText(new URL("data/vocab/curriculum.json", baseUrl).toString(), "live curriculum"),
    fetchText(new URL("sw.js", baseUrl).toString(), "live service worker")
  ]);

  let liveManifest = {};
  let liveCurriculum = {};

  try {
    liveManifest = manifestText ? JSON.parse(manifestText) : {};
  } catch (error) {
    errors.push(`live manifest: invalid JSON (${error.message})`);
  }

  try {
    liveCurriculum = curriculumText ? JSON.parse(curriculumText) : {};
  } catch (error) {
    errors.push(`live curriculum: invalid JSON (${error.message})`);
  }

  const actual = {
    baseUrl,
    seedVersion: liveCurriculum.seed_version || "",
    runnableLessons: String((liveCurriculum.lessons || []).length),
    questionFiles: String((liveCurriculum.question_files || []).length),
    manifestStartUrl: liveManifest.start_url || "",
    manifestScope: liveManifest.scope || "",
    manifestDisplay: liveManifest.display || "",
    cacheName: swText ? extractConstFromText(swText, "CACHE_NAME", "live sw.js") : "",
    launcherNote: extractRemoteLauncherNote(indexText)
  };

  expectEqual("manifest start_url", actual.manifestStartUrl, expected.manifestStartUrl);
  expectEqual("manifest scope", actual.manifestScope, expected.manifestScope);
  expectEqual("manifest display", actual.manifestDisplay, expected.manifestDisplay);
  expectEqual("curriculum seed_version", actual.seedVersion, expected.seedVersion);
  expectEqual("curriculum lessons.length", actual.runnableLessons, expected.runnableLessons);
  expectEqual("curriculum question_files.length", actual.questionFiles, expected.questionFiles);
  expectEqual("sw.js CACHE_NAME", actual.cacheName, expected.cacheName);
  expectEqual("launcher note", actual.launcherNote, expected.launcherNote);

  console.log("Live Pages release summary:");
  console.log(`- base URL: ${baseUrl}`);
  console.log(`- manifest start_url: ${actual.manifestStartUrl}`);
  console.log(`- manifest scope: ${actual.manifestScope}`);
  console.log(`- manifest display: ${actual.manifestDisplay}`);
  console.log(`- live seed_version: ${actual.seedVersion}`);
  console.log(`- live runnable lessons: ${actual.runnableLessons}`);
  console.log(`- live question files: ${actual.questionFiles}`);
  console.log(`- live cache name: ${actual.cacheName}`);
  console.log(`- live launcher note: ${actual.launcherNote || "(missing)"}`);

  finish();
}

function finish() {
  if (errors.length) {
    console.error("\nLive Pages release errors:");
    errors.forEach((error) => console.error(`- ${error}`));
    if (softFail) {
      console.log("\nLive Pages release check completed in soft mode.");
      return;
    }
    process.exit(1);
  }

  console.log("\nLive Pages release check passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});