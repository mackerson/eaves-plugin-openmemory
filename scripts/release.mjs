#!/usr/bin/env node
// Shared plugin release script — copy into each plugin repo as scripts/release.mjs.
// Builds the UI, packs the runtime bundle, checksums it, and prints the registry
// release{} block. Run locally: `node scripts/release.mjs` (add --publish to cut a
// GitHub release via gh). CI runs it with --publish on tag push (see release.yml).
//
// The bundle contains only what the sandbox loads at runtime — plugin.json, the
// backend entry, and ui/dist — at the tar root, so install unpacks it straight
// into userData/plugins/<id>/. Plugins with backend node deps must bundle them
// into the entry first (esbuild); this script does not vendor node_modules.

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';

const run = (c) => execSync(c, { stdio: 'inherit' });
const capture = (c) => execSync(c, { encoding: 'utf8' }).trim();

const manifest = JSON.parse(readFileSync('plugin.json', 'utf8'));
const shortName = manifest.id.split('.').pop();
const version = manifest.version;
const tag = `v${version}`;
const asset = `${shortName}-${version}.tgz`;

// Resolve the repo slug from the git remote (handles ssh host aliases like
// git@github-personal:mackerson/eaves-plugin-foo.git).
let repoSlug = `mackerson/eaves-plugin-${shortName}`;
try {
  const remote = capture('git config --get remote.origin.url');
  const m = remote.match(/[:/](mackerson\/[^/]+?)(?:\.git)?$/);
  if (m) repoSlug = m[1];
} catch { /* not a git checkout — fall back to the guessed slug */ }

// 1. Build the UI (skip if the plugin has no vite build)
if (existsSync('vite.config.ts') || existsSync('vite.config.js')) run('yarn build');

// 2. Assemble the runtime bundle file list
const files = ['plugin.json', manifest.entry || 'index.cjs'];
if (existsSync('lib')) files.push('lib'); // backend modules the entry require()s
if (existsSync('ui/dist')) files.push('ui/dist');
for (const f of files) {
  if (!existsSync(f)) { console.error(`ERROR: missing bundle file: ${f}`); process.exit(1); }
}
if (manifest.sandboxVersion !== 1) {
  console.error('ERROR: plugin.json is missing "sandboxVersion": 1 — the app will skip it.');
  process.exit(1);
}

// 3. Pack (ustar for portability)
run(`tar --format=ustar -czf ${asset} ${files.join(' ')}`);

// 4. Checksum
const sha256 = await new Promise((res, rej) => {
  const h = createHash('sha256');
  createReadStream(asset).on('data', (d) => h.update(d)).on('end', () => res(h.digest('hex'))).on('error', rej);
});

const url = `https://github.com/${repoSlug}/releases/download/${tag}/${asset}`;
console.log(`\nBuilt ${asset}\n  sha256 ${sha256}\n`);
console.log('Paste into registry.json for ' + manifest.id + ':');
console.log(JSON.stringify({ tag, asset, url, sha256 }, null, 2));

// 5. Publish (CI passes --publish; gh uses GH_TOKEN/GITHUB_TOKEN)
if (process.argv.includes('--publish')) {
  run(`gh release create ${tag} ${asset} --title "${manifest.name} ${version}" --notes "Automated build of ${manifest.name} ${version}."`);
  console.log(`\nPublished ${tag}. Update registry.json for ${manifest.id} with the block above.`);
}
