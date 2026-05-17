#!/usr/bin/env node
const path = require("path");
const {
  applyPatchToMemory,
  loadPatch,
  loadSeedContext,
  parseArgs,
  updateSeedVersions,
  writeQuestionFiles
} = require("./questionbank-patch-lib");

function usage() {
  console.log(`Usage:
  node scripts/apply-questionbank-patch.js --patch tmp/questionbank-edits.patch.json
  node scripts/apply-questionbank-patch.js --patch tmp/questionbank-edits.patch.json --write --new-seed-version toeic_vocab_tracker_...

Default mode is dry-run. Use --write only after reviewing the patch.`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.patch) {
    usage();
    process.exitCode = 1;
    return;
  }

  const context = loadSeedContext(args.root || process.cwd());
  const patch = loadPatch(path.resolve(args.patch));
  const results = applyPatchToMemory(patch, context, {
    force: !!args.force,
    draft: !!args.draft,
    allowAdd: !!args["allow-add"],
    allowDelete: !!args["allow-delete"],
    allowIdChange: !!args["allow-id-change"]
  });

  if (args.write) {
    writeQuestionFiles(context);
    updateSeedVersions(context, args["new-seed-version"]);
    console.log(`Patch applied. Seed version updated to ${args["new-seed-version"]}.`);
  } else {
    console.log("Dry run passed. No files were modified.");
  }

  console.log(`Changes checked: ${results.length}`);
  results.forEach((row) => console.log(`- ${row.question_id} -> ${row.file} (${row.fields_changed.join(", ")})`));
}

try {
  main();
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
}
