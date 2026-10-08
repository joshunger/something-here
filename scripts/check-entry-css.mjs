import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve('.next');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const manifests = walk(path.join(root, 'server/app')).filter(file => file.endsWith('_client-reference-manifest.js'));
const entryCss = new Set();
const perRoute = {};

for (const manifestPath of manifests) {
  const sandbox = {};
  vm.runInNewContext(fs.readFileSync(manifestPath, 'utf8'), { globalThis: sandbox });
  const route = path.relative(path.join(root, 'server/app'), manifestPath);
  const routeFiles = new Set();
  for (const manifest of Object.values(sandbox.__RSC_MANIFEST ?? {})) {
    for (const [entryId, files] of Object.entries(manifest.entryCSSFiles ?? {})) {
      const ownsEntry = route.startsWith('page_client-reference-manifest')
        ? entryId.endsWith('/app/page')
        : entryId.endsWith(`/${route.replace(/\/page_client-reference-manifest\.js$/, '')}`);
      if (!ownsEntry) continue;
      for (const file of files) {
        entryCss.add(file.path);
        routeFiles.add(file.path);
      }
    }
  }
  let bytes = 0;
  let marker = false;
  for (const file of routeFiles) {
    const css = fs.readFileSync(path.join(root, file), 'utf8');
    bytes += Buffer.byteLength(css);
    if (css.includes('ASYNC_ONLY_MARKER')) marker = true;
  }
  perRoute[route] = { bytes, marker, files: [...routeFiles] };
}

let entryBytes = 0;
let markerInEntry = false;
for (const file of entryCss) {
  const absolute = path.join(root, file);
  const css = fs.readFileSync(absolute, 'utf8');
  entryBytes += fs.statSync(absolute).size;
  if (css.includes('ASYNC_ONLY_MARKER')) markerInEntry = true;
}

const allCss = walk(path.join(root, 'static/css')).filter(file => file.endsWith('.css'));
const markerAnywhere = allCss.some(file => fs.readFileSync(file, 'utf8').includes('ASYNC_ONLY_MARKER'));

console.log(
  JSON.stringify(
    {
      cssChunking: process.env.CSS_CHUNKING === 'strict' ? 'strict' : 'loose',
      entryCssFiles: [...entryCss].sort(),
      entryBytes,
      markerInEntry,
      markerAnywhere,
      perRoute
    },
    null,
    2
  )
);

if (!markerAnywhere) {
  console.error('ASYNC_ONLY_MARKER was not emitted in any CSS file');
  process.exit(1);
}
