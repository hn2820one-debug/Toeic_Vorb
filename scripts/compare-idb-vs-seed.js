#!/usr/bin/env node
const path = require("path");
const {
  compareSnapshotToSeed,
  loadPatch,
  loadSeedContext,
  loadSnapshot,
  parseArgs,
  writeJson
} = require("./questionbank-patch-lib");

function usage() {
  console.log(`Usage:
  node scripts/compare-idb-vs-seed.js --snapshot path/to/question_bank_snapshot.json
  node scripts/compare-idb-vs-seed.js --patch tmp/questionbank-edits.patch.json

This script is read-only and never mutates production seed files.`);
}

function reportFromPatch(patch) {
  return {
    same: [],
    changed: patch.changes.filter((change) => change.change_type === "update").map((change) => ({
      question_id: change.question_id,
      file: change.file_hint,
      fields_changed: change.fields_changed || []
    })),
    local_only: patch.changes.filter((change) => change.change_type === "add").map((change) => ({ question_id: change.question_id })),
    seed_only: patch.changes.filter((change) => change.change_type === "delete").map((change) => ({ question_id: change.question_id, file: change.file_hint }))
  };
}

function printReport(report) {
  console.log("IDB/local-vs-seed comparison:");
  console.log(`- same: ${report.same.length}`);
  console.log(`- changed: ${report.changed.length}`);
  console.log(`- local_only: ${report.local_only.length}`);
  console.log(`- seed_only: ${report.seed_only.length}`);
  report.changed.slice(0, 20).forEach((row) => {
    console.log(`  changed ${row.question_id} (${row.file}): ${(row.fields_changed || []).join(", ")}`);
  });
  if (report.changed.length > 20) console.log(`  ... and ${report.changed.length - 20} more changed rows`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.snapshot && !args.patch) {
    usage();
    process.exitCode = 1;
    return;
  }

  const context = loadSeedContext(args.root || process.cwd());
  const report = args.patch
    ? reportFromPatch(loadPatch(path.resolve(args.patch)))
    : compareSnapshotToSeed(loadSnapshot(path.resolve(args.snapshot)), context);

  printReport(report);
  if (args.json) writeJson(path.resolve(args.json), report);
}

try {
  main();
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
}
