// Normal sync is self-contained. --from-siblings also imports external builds.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const copies = [['dreadworks', 'projects/dreadworks/index.html'], ['idle-farm', 'projects/idle-farm/index.html']];
const fromSiblings = process.argv.includes('--from-siblings');
if (fromSiblings) copies.push(
 ['pinecone-pass', '../pinecone-pass/pinecone-pass-prototype/pinecone-pass-prototype.html'],
 ['blackwater', '../pirates-redo/dist/index.html']
);
for (const [,source] of copies) fs.accessSync(path.resolve(root, source));
if (fromSiblings) fs.accessSync(path.resolve(root, '../pirates-redo/dist/assets'));
for (const [slug,source] of copies) {
 fs.mkdirSync(path.join(root,'public',slug),{recursive:true});
 fs.copyFileSync(path.resolve(root,source),path.join(root,'public',slug,'play.html'));
}
fs.cpSync(path.join(root,'projects/idle-farm/vendor'),path.join(root,'public/idle-farm/vendor'),{recursive:true});
if (fromSiblings) fs.cpSync(path.resolve(root,'../pirates-redo/dist/assets'),path.join(root,'public/blackwater/assets'),{recursive:true});
const file=path.join(root,'projects/catalog.json');
const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
for(const game of catalog) {
 const source=copies.find(([slug])=>slug===game.slug);
 if(source)game.source=source[1];
 game.sha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'public',game.slug,'play.html'))).digest('hex');
}
fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n');
console.log('Synced maintained sources and refreshed served HTML hashes.');
