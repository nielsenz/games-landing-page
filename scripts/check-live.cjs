// Check the published files against this checkout. Does not modify the site.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const origin = process.argv[2] || 'https://games.zacharynielsen.com';
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'projects/catalog.json'), 'utf8'));
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function comparable(bytes, relative) {
 if (!relative.endsWith('.html')) return bytes;
 // Netlify pretty-URL processing rewrites anchors, but leaves game code intact.
 return bytes.toString().replace(/(<a\b[^>]*\bhref=)(["'])([^"']+)\2/g, (all,prefix,quote,href) => {
  const url = new URL(href, new URL(relative, origin));
  if (url.origin !== new URL(origin).origin) return all;
  const route = url.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  return `${prefix}"${route}${url.search}${url.hash}"`;
 });
}
async function check(relative) {
 const response = await fetch(new URL(relative, origin), {signal:AbortSignal.timeout(20000),cache:'no-store'});
 if (!response.ok) throw new Error(`${relative}: HTTP ${response.status}`);
 const content=Buffer.from(await response.arrayBuffer());
 const local=fs.readFileSync(path.join(root,'public',relative));
 if(digest(comparable(content,relative))!==digest(comparable(local,relative)))throw new Error(`${relative}: deployed content differs from checkout`);
 return content.toString();
}
(async()=>{
 await check('/index.html');
 for(const game of catalog){
  await check(`/${game.slug}/index.html`);
  const html=await check(`/${game.slug}/play.html`);
  for(const [,asset] of html.matchAll(/(?:src|href)="((?:\.\/assets\/|vendor\/)[^"?#]+)"/g))await check(`/${game.slug}/${asset.replace(/^\.\//,'')}`);
  console.log(`${game.name}: wrapper, game and referenced build assets match`);
 }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
