const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const tempSite = path.join(os.tmpdir(), "toeic-vorb-pages-baseline-site");

const rootFiles = ["index.html", "tracker.html", "clear-sw.html", "manifest.json", "sw.js"];
const artifactDirs = ["css", "js", "data", "icons"];
const requiredArtifactFiles = [
  ...rootFiles,
  "css/base.css",
  "css/tracker.css",
  "js/vocab-db.js",
  "js/vocab-scoring.js",
  "js/state.js",
  "js/vocab-tracker.js",
  "js/views/today.js",
  "js/views/roadmap.js",
  "js/views/lesson.js",
  "js/views/mistakes.js",
  "js/views/mastery.js",
  "js/views/export.js",
  "js/views/bank.js",
  "js/views/settings.js",
  "data/vocab/curriculum.json",
  "data/vocab/vocab_items.json",
  "data/vocab/grammar_links.json",
  "icons/icon-192.svg",
  "icons/icon-512.svg"
];
const forbiddenArtifactEntries = [
  ".github",
  ".claude",
  "Background",
  "docs",
  "drafts",
  "node_modules",
  "playwright-report",
  "test-results",
  "tests",
  "tmp"
];

function fail(message) {
  throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function copyArtifact() {
  const resolvedTemp = path.resolve(tempSite);
  const resolvedOsTemp = path.resolve(os.tmpdir());
  assert(
    resolvedTemp.startsWith(resolvedOsTemp + path.sep),
    `Refusing to clean unexpected temp path: ${resolvedTemp}`
  );

  fs.rmSync(resolvedTemp, { recursive: true, force: true });
  fs.mkdirSync(resolvedTemp, { recursive: true });

  for (const fileName of rootFiles) {
    fs.copyFileSync(path.join(root, fileName), path.join(resolvedTemp, fileName));
  }
  for (const dirName of artifactDirs) {
    fs.cpSync(path.join(root, dirName), path.join(resolvedTemp, dirName), { recursive: true });
  }
  return resolvedTemp;
}

function walkFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeSlash(filePath) {
  return filePath.replace(/\\/g, "/");
}

function verifyWorkflow() {
  const workflow = read(".github/workflows/pages.yml");
  const triggerBlock = workflow.match(/^on:\s*[\r\n]+([\s\S]*?)^[a-zA-Z_-]+:/m)?.[1] || "";

  assert(/push:\s*[\s\S]*branches:\s*[\s\S]*-\s*main/.test(triggerBlock), "Pages workflow must publish pushes from main.");
  assert(/workflow_dispatch\s*:/.test(triggerBlock), "Pages workflow must support workflow_dispatch.");
  for (const trigger of ["pull_request", "schedule", "workflow_run", "repository_dispatch"]) {
    assert(!new RegExp(`\\b${trigger}\\s*:`).test(triggerBlock), `Pages workflow has unexpected trigger: ${trigger}.`);
  }

  for (const fileName of rootFiles) {
    assert(workflow.includes(fileName), `Pages workflow artifact copy omits ${fileName}.`);
  }
  for (const dirName of artifactDirs) {
    assert(new RegExp(`\\b${dirName}\\b`).test(workflow), `Pages workflow artifact copy omits ${dirName}/.`);
  }
  assert(/actions\/upload-pages-artifact@v3/.test(workflow), "Pages workflow must upload a Pages artifact.");
  assert(/path:\s*\/tmp\/site/.test(workflow), "Pages workflow artifact path must be /tmp/site.");
  assert(/actions\/deploy-pages@v4/.test(workflow), "Pages workflow must deploy with actions/deploy-pages.");

  return {
    workflowPushMain: true,
    workflowDispatch: true,
    artifactRootFiles: true,
    artifactDirs: true,
    uploadPathTmpSite: true,
    deployPages: true
  };
}

function verifyArtifact() {
  const site = copyArtifact();
  const curriculum = JSON.parse(fs.readFileSync(path.join(site, "data/vocab/curriculum.json"), "utf8"));
  const questionFiles = Array.isArray(curriculum.question_files) ? curriculum.question_files : [];
  const requiredFiles = [
    ...requiredArtifactFiles,
    ...questionFiles.map((fileName) => `data/vocab/${fileName}`)
  ];

  const missing = requiredFiles.filter((relativePath) => !fs.existsSync(path.join(site, relativePath)));
  assert(missing.length === 0, `Pages artifact is missing required files: ${missing.join(", ")}`);

  const forbiddenPresent = forbiddenArtifactEntries.filter((entry) => fs.existsSync(path.join(site, entry)));
  assert(forbiddenPresent.length === 0, `Pages artifact contains forbidden entries: ${forbiddenPresent.join(", ")}`);

  return {
    site,
    requiredMissing: missing,
    forbiddenPresent,
    fileCount: walkFiles(site).length
  };
}

function verifyRelativePaths() {
  const filePaths = [
    ...rootFiles,
    ...walkFiles(path.join(root, "js")).map((filePath) => path.relative(root, filePath)),
    ...walkFiles(path.join(root, "css")).map((filePath) => path.relative(root, filePath))
  ];

  const rootAbsoluteMatches = [];
  const patterns = [
    /\b(?:href|src)=["']\/(?!\/)/g,
    /\b(?:fetch|register|import)\(\s*["']\/(?!\/)/g,
    /\bfrom\s+["']\/(?!\/)/g,
    /\blocation\.href\s*=\s*["']\/(?!\/)/g,
    /url\(\s*["']?\/(?!\/)/g
  ];

  for (const relativePath of filePaths) {
    const text = read(relativePath);
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const prefix = text.slice(0, match.index);
        const line = prefix.split(/\r?\n/).length;
        rootAbsoluteMatches.push(`${normalizeSlash(relativePath)}:${line}:${match[0]}`);
      }
    }
  }

  assert(rootAbsoluteMatches.length === 0, `Root-absolute paths found:\n${rootAbsoluteMatches.join("\n")}`);

  const indexHtml = read("index.html");
  const trackerHtml = read("tracker.html");
  const clearSwHtml = read("clear-sw.html");
  assert(indexHtml.includes('href="./tracker.html"'), "index.html must link to ./tracker.html.");
  assert(indexHtml.includes('href="./clear-sw.html"'), "index.html must link to ./clear-sw.html.");
  assert(indexHtml.includes('register("./sw.js")'), "index.html must register ./sw.js.");
  assert(trackerHtml.includes('location.href=\'./index.html\''), "tracker.html must navigate back to ./index.html.");
  assert(trackerHtml.includes('register("./sw.js")'), "tracker.html must register ./sw.js.");
  assert(clearSwHtml.includes("location.href='./index.html'"), "clear-sw.html must navigate to ./index.html.");

  return {
    rootAbsoluteMatches,
    indexToTrackerRelative: true,
    trackerReturnRelative: true,
    clearSwReturnRelative: true
  };
}

function main() {
  const workflow = verifyWorkflow();
  const artifact = verifyArtifact();
  const relativePaths = verifyRelativePaths();

  console.log(JSON.stringify({
    status: "passed",
    workflow,
    artifact,
    relativePaths
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`Pages baseline verification failed: ${error.message}`);
  process.exit(1);
}
