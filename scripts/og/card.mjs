// One link-preview card as HTML, rendered to 1200x630 by build-og.mjs.
//
// Layout is the MoneyBees /finternship poster Leo picked on 2026-10-08 (logo top left, pill
// top right, heavy Anton headline, a tilted bar, up to two round badges), drawn in this app's
// own colours: navy ground, --accent yellow bar, --accent-warm and --primary badges. Every
// word on a card is a page name or a count read from the content; nothing is made up here.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const file = (p) => `file://${p}`;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * card: { headline, pill, bar?, badges?: [{ big, small }] }
 * The headline shrinks until it fits three lines; the page script marks body[data-fit] when done.
 */
export function cardHtml(card) {
  const badges = (card.badges || []).slice(0, 2);
  const wide = badges.length === 0;
  return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  @font-face { font-family: Anton; src: url('${file(path.join(HERE, 'fonts/anton-latin.woff2'))}') format('woff2'); }
  @font-face { font-family: Montserrat; font-weight: 500 800; src: url('${file(path.join(HERE, 'fonts/montserrat-latin.woff2'))}') format('woff2'); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; position: relative;
         background: #0B2A4F; font-family: Montserrat, sans-serif; color: #fff; }
  .glow { position: absolute; width: 760px; height: 760px; right: -220px; top: -150px; border-radius: 50%;
          background: #123D70; }
  .top { position: absolute; left: 64px; right: 64px; top: 52px; display: flex; align-items: center;
         justify-content: space-between; gap: 24px; }
  .brand { display: flex; align-items: center; gap: 16px; }
  .brand img { width: 58px; height: 58px; }
  .brand b { display: block; font-weight: 800; font-size: 30px; letter-spacing: -0.01em; line-height: 1; }
  .brand span { display: block; margin-top: 6px; font-weight: 600; font-size: 17px; color: #A9C4E8; }
  .pill { background: #FAC938; color: #0B2A4F; font-weight: 700; font-size: 21px; padding: 11px 24px;
          border-radius: 999px; white-space: nowrap; max-width: 560px; overflow: hidden; text-overflow: ellipsis; }
  .main { position: absolute; left: 64px; top: 168px; width: ${wide ? 1072 : 790}px; bottom: 48px;
          display: flex; flex-direction: column; justify-content: center; }
  h1 { font-family: Anton, Impact, sans-serif; font-weight: 400; text-transform: uppercase;
       line-height: 1.02; letter-spacing: 0.005em; font-size: 124px; overflow-wrap: anywhere; }
  .bar { align-self: flex-start; margin-top: 22px; background: #FAC938; color: #0B2A4F;
         font-family: Anton, Impact, sans-serif; text-transform: uppercase; font-size: 44px; line-height: 1;
         padding: 14px 26px 12px; transform: rotate(-1.5deg); max-width: 100%; white-space: nowrap;
         overflow: hidden; text-overflow: ellipsis; }
  .badge { position: absolute; width: 214px; height: 214px; border-radius: 50%; border: 6px solid #fff;
           display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .badge.a { right: 82px; top: 178px; background: #F0703F; }
  .badge.b { right: 168px; top: 384px; width: 180px; height: 180px; background: #1B5EBB; }
  .badge strong { font-family: Anton, Impact, sans-serif; font-weight: 400; font-size: 64px; line-height: 1; }
  .badge.b strong { font-size: 52px; }
  .badge small { margin-top: 6px; font-weight: 700; font-size: 20px; line-height: 1.15; max-width: 150px; }
</style></head>
<body>
  <div class="glow"></div>
  <div class="top">
    <div class="brand"><img src="${file(path.join(ROOT, 'public/finternship-logo-white.png'))}" alt="" />
      <div><b>FINternship</b><span>Learning Platform</span></div></div>
    ${card.pill ? `<div class="pill">${esc(card.pill)}</div>` : ''}
  </div>
  <div class="main">
    <h1>${esc(card.headline)}</h1>
    ${card.bar ? `<div class="bar">${esc(card.bar)}</div>` : ''}
  </div>
  ${badges.map((b, i) => `<div class="badge ${i ? 'b' : 'a'}"><strong>${esc(b.big)}</strong>${b.small ? `<small>${esc(b.small)}</small>` : ''}</div>`).join('')}
  <script>
    document.fonts.ready.then(() => {
      const h = document.querySelector('h1');
      const main = document.querySelector('.main');
      const bar = document.querySelector('.bar');
      const room = () => main.clientHeight - (bar ? bar.offsetHeight + 22 : 0);
      let size = 124;
      const lines = () => Math.round(h.scrollHeight / (size * 1.02));
      while (size > 56 && (lines() > 3 || h.scrollHeight > room() || h.scrollWidth > main.clientWidth)) {
        size -= 4;
        h.style.fontSize = size + 'px';
      }
      document.body.dataset.fit = String(size);
    });
  </script>
</body></html>`;
}

export { ROOT };
