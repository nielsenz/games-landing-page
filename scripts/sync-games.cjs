// Build sibling sources first; this copies their artifacts without deploying.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const copies = [
 ['dreadworks', '../hostile-architect/index.html'],
 ['pinecone-pass', '../pinecone-pass/pinecone-pass-prototype/pinecone-pass-prototype.html'],
 ['blackwater', '../pirates-redo/dist/index.html']
];
// Validate every input before changing any served file.
for (const [,source] of copies) fs.accessSync(path.resolve(root, source));
fs.accessSync(path.resolve(root, '../pirates-redo/dist/assets'));
for (const [slug,source] of copies) fs.copyFileSync(path.resolve(root,source),path.join(root,'public',slug,'play.html'));
fs.cpSync(path.resolve(root,'../pirates-redo/dist/assets'),path.join(root,'public/blackwater/assets'),{recursive:true});
const file=path.join(root,'projects/catalog.json');
const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
for(const game of catalog) {
 const source=copies.find(([slug])=>slug===game.slug);
 if(source)game.source=source[1];
 game.sha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'public',game.slug,'play.html'))).digest('hex');
}
fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n');
console.log('Synced Dreadworks, Pinecone Pass, and Blackwater; refreshed all served HTML hashes.');
