const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const tempSite = path.join(os.tmpdir(), "toeic-vorb-pages-sw-site");
const rootFiles = ["index.html", "tracker.html", "clear-sw.html", "manifest.json", "sw.js"];
const artifactDirs = ["css", "js", "data", "icons"];

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
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

function cleanupArtifact() {
  fs.rmSync(tempSite, { recursive: true, force: true });
}

function extractStringConst(source, constName) {
  const match = source.match(new RegExp(`const ${constName} = ["']([^"']+)["'];`));
  assert(match, `Could not find ${constName} in sw.js.`);
  return match[1];
}

function extractArrayConst(source, constName) {
  const start = source.indexOf(`const ${constName} = [`);
  assert(start >= 0, `Could not find ${constName} in sw.js.`);

  const arrayStart = source.indexOf("[", start);
  const arrayEnd = source.indexOf("];", arrayStart);
  assert(arrayStart >= 0 && arrayEnd >= 0, `Could not parse ${constName} from sw.js.`);

  const literal = source.slice(arrayStart, arrayEnd + 1);
  return Function(`"use strict"; return (${literal});`)();
}

function verifyRegistrationPaths() {
  const indexHtml = read("index.html");
  const trackerHtml = read("tracker.html");

  assert(indexHtml.includes('register("./sw.js")'), "index.html must register ./sw.js.");
  assert(trackerHtml.includes('register("./sw.js")'), "tracker.html must register ./sw.js.");

  return {
    indexRegistersRelativeSw: true,
    trackerRegistersRelativeSw: true
  };
}

function verifyStaticAssets() {
  const site = copyArtifact();
  const swSource = read("sw.js");
  const cacheName = extractStringConst(swSource, "CACHE_NAME");
  const staticAssets = extractArrayConst(swSource, "STATIC_ASSETS");
  const curriculum = JSON.parse(fs.readFileSync(path.join(site, "data/vocab/curriculum.json"), "utf8"));
  const questionFiles = Array.isArray(curriculum.question_files) ? curriculum.question_files : [];
  const runtimeDataAssets = [
    "./data/vocab/curriculum.json",
    "./data/vocab/vocab_items.json",
    "./data/vocab/grammar_links.json",
    ...questionFiles.map((fileName) => `./data/vocab/${fileName}`)
  ];

  const nonRelativeAssets = staticAssets.filter((asset) => !asset.startsWith("./"));
  assert(nonRelativeAssets.length === 0, `STATIC_ASSETS must stay relative: ${nonRelativeAssets.join(", ")}`);

  const missingInArtifact = staticAssets
    .filter((asset) => asset !== "./")
    .filter((asset) => !fs.existsSync(path.join(site, asset.slice(2))));
  assert(missingInArtifact.length === 0, `STATIC_ASSETS contains missing artifact files: ${missingInArtifact.join(", ")}`);

  const missingRuntimeAssets = runtimeDataAssets.filter((asset) => !staticAssets.includes(asset));
  assert(missingRuntimeAssets.length === 0, `STATIC_ASSETS omits runtime-fetched data files: ${missingRuntimeAssets.join(", ")}`);

  return {
    cacheName,
    staticAssetCount: staticAssets.length,
    runtimeDataAssetCount: runtimeDataAssets.length,
    missingInArtifact,
    missingRuntimeAssets,
    includesGrammarLinks: staticAssets.includes("./data/vocab/grammar_links.json")
  };
}

function verifyFetchStrategy() {
  const swSource = read("sw.js");

  const hasCacheBumpPolicyNote = swSource.includes("Advance CACHE_NAME only when a deployed asset or production seed changes.");
  const hasFetchAndCacheHelper = swSource.includes("function fetchAndCache(request)");
  const hasVocabDataMatcher = swSource.includes("function isVocabDataRequest(requestUrl)");
  const hasNetworkFirstVocabData = swSource.includes("if (isVocabDataRequest(requestUrl))")
    && swSource.includes("fetchAndCache(event.request).catch(() =>")
    && swSource.includes("caches.match(event.request).then((cached) => cached || Response.error())");
  const hasStaleWhileRevalidateShell = swSource.includes("const cacheUpdate = fetchAndCache(event.request).catch(() => null);")
    && swSource.includes("cached || cacheUpdate.then((response) => response || Response.error())");
  const updatesBasic200Responses = swSource.includes("response && response.status === 200 && response.type === \"basic\"");

  assert(hasCacheBumpPolicyNote, "sw.js must document the cache bump policy.");
  assert(hasFetchAndCacheHelper, "sw.js must keep the shared fetchAndCache helper.");
  assert(hasVocabDataMatcher, "sw.js must keep the vocab data request matcher.");
  assert(hasNetworkFirstVocabData, "sw.js must keep network-first fallback for ./data/vocab/*.json requests.");
  assert(hasStaleWhileRevalidateShell, "sw.js must keep stale-while-revalidate for shell assets.");
  assert(updatesBasic200Responses, "sw.js must cache successful same-origin 200 responses.");

  return {
    cacheBumpPolicyDocumented: true,
    vocabDataStrategy: "network-first-fallback",
    shellStrategy: "stale-while-revalidate",
    updatesBasic200Responses: true
  };
}

function main() {
  const registration = verifyRegistrationPaths();
  const staticAssets = verifyStaticAssets();
  const fetchStrategy = verifyFetchStrategy();

  console.log(JSON.stringify({
    status: "passed",
    registration,
    staticAssets,
    fetchStrategy
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`Pages service worker verification failed: ${error.message}`);
  process.exit(1);
} finally {
  cleanupArtifact();
}