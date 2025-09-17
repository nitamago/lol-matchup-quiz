import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const staticDir = path.join(publicDir, 'static');

const urls = ['https://nitamago.github.io/lol-matchup-quiz/'];

// public/static 配下の HTML を自動で追加
fs.readdirSync(staticDir).forEach(file => {
  if (file.endsWith('.html')) {
    urls.push(`https://nitamago.github.io/lol-matchup-quiz/static/${encodeURIComponent(file)}`);
  }
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><priority>0.8</priority></url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log('sitemap.xml generated!');
