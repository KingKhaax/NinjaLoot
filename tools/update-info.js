// Genera latest.yml y <instalador>.blockmap para electron-updater a partir del instalador YA firmado,
// para que las actualizaciones descarguen solo las partes que han cambiado.
// Uso: node tools/update-info.js <carpeta> <instalador.exe> <versión>
'use strict';
const fs = require('fs');
const path = require('path');
const { buildBlockMap } = require('app-builder-lib/out/targets/blockmap/blockmap');

const [dir, file, version] = process.argv.slice(2);
(async () => {
  const full = path.join(dir, file);
  const info = await buildBlockMap(full, 'gzip', `${full}.blockmap`);
  const yml = [
    `version: ${version}`,
    'files:',
    `  - url: ${file}`,
    `    sha512: ${info.sha512}`,
    `    size: ${info.size}`,
    `path: ${file}`,
    `sha512: ${info.sha512}`,
    `releaseDate: '${new Date().toISOString()}'`,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'latest.yml'), yml);
  console.log(yml);
})().catch(e => { console.error(e); process.exit(1); });
