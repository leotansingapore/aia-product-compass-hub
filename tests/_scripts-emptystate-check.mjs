// Verify the smart empty state: zero-result combo offers per-filter recovery,
// each button's promised count is honest, and one tap actually recovers.
import { launch, login, gotoScripts, clearScriptsStorage, resultCount } from './_scripts-helpers.mjs';

const { b, p } = await launch();
await login(p);
await gotoScripts(p);
await clearScriptsStorage(p);

await gotoScripts(p, '?category=referral&audience=nsf');
console.log('results:', await resultCount(p));
const empty = p.locator('text=No scripts found');
console.log('empty visible:', await empty.isVisible());
const buttons = await p.locator('button:has-text("Remove ")').allInnerTexts();
console.log('recovery buttons:', JSON.stringify(buttons));

// Tap the first recovery button, verify the promised count materialises
if (buttons.length) {
  const promised = parseInt(buttons[0].match(/(\d+) script/)?.[1] || '0', 10);
  await p.locator('button:has-text("Remove ")').first().click();
  await p.waitForTimeout(600);
  const actual = await resultCount(p);
  console.log(`first button promised ${promised}, after tap results = ${actual}, match = ${promised === actual}`);
  console.log('url now:', p.url());
}

// Also test with a search query in the mix
await gotoScripts(p, '?q=zzzznothing&category=cold-calling');
const btns2 = await p.locator('button:has-text("Remove ")').allInnerTexts();
console.log('\nq+category zero-state buttons:', JSON.stringify(btns2));

await p.screenshot({ path: '/private/tmp/claude-501/-Users-leo/8c05f4d2-7c83-46f5-b3be-ab7cad065c0d/scratchpad/scripts-emptystate.png' });
await b.close();
