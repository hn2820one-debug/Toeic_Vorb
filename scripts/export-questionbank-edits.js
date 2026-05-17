#!/usr/bin/env node
const path = require("path");
const {
  applyPatchToMemory,
  buildPatchFromSnapshot,
  loadPatch,
  loadSeedContext,
  loadSnapshot,
  parseArgs,
  writeJson
} = require("./questionbank-patch-lib");

function usage() {
  console.log(`Usage:
  node scripts/export-questionbank-edits.js --snapshot path/to/question_bank_snapshot.json --output tmp/questionbank-edits.patch.json
  node scripts/export-questionbank-edits.js --validate-patch tmp/questionbank-edits.patch.json

Notes:
  Node cannot read browser IndexedDB directly. Export question_bank_snapshot.json or use the browser's Export Local Edits Patch button first.`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = args.root || process.cwd();
  const context = loadSeedContext(root);

  if (args["validate-patch"]) {
    const patch = loadPatch(path.resolve(args["validate-patch"]));
    const results = applyPatchToMemory(patch, context, { force: !!args.force });
    console.log(`Patch is valid. Changes: ${results.length}`);
    results.forEach((row) => console.log(`- ${row.question_id} -> ${row.file} (${row.fields_changed.join(", ")})`));
    return;
  }

  if (!args.snapshot) {
    usage();
    process.exitCode = 1;
    return;
  }

  const snapshot = loadSnapshot(path.resolve(args.snapshot));
  const patch = buildPatchFromSnapshot(snapshot, context);
  const output = args.output || path.join(context.root, "tmp", "questionbank-edits.patch.json");
  writeJson(path.resolve(output), patch);
  console.log(`Patch written: ${output}`);
  console.log(`Changes: ${patch.changes.length}`);
}

try {
  main();
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
}
