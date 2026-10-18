// deno test supabase/functions/fintern-progress/handler.test.ts
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { handle, type Reader } from "./handler.ts";

function fakeReader(rows: { day_number: number; quiz_passed_at: string }[] | null, asked: string[] = []): Reader {
  return {
    profileId: async (email) => { asked.push(email); return { id: rows ? 'u1' : null, error: null }; },
    completed: async () => ({ rows: rows ?? [], error: null }),
  };
}
const post = (body: unknown, secret?: string) => new Request('https://x/fintern-progress', {
  method: 'POST', body: JSON.stringify(body), headers: secret === undefined ? {} : { 'x-fintern-secret': secret },
});
const run = (req: Request, rows: { day_number: number; quiz_passed_at: string }[] | null, asked: string[] = []) =>
  handle(req, { secret: 's3cret', reader: () => fakeReader(rows, asked) });

Deno.test('a wrong, missing or unset secret reads nothing', async () => {
  const asked: string[] = [];
  assertEquals((await run(post({ email: 'a@b.co' }, 'nope'), [], asked)).status, 401);
  assertEquals((await run(post({ email: 'a@b.co' }), [], asked)).status, 401);
  assertEquals((await handle(post({ email: 'a@b.co' }, ''), { secret: '', reader: () => fakeReader([], asked) })).status, 401);
  assertEquals(asked.length, 0);
});
Deno.test('a bad email is refused before any read', async () => {
  const asked: string[] = [];
  assertEquals((await run(post({ email: 'nope' }, 's3cret'), [], asked)).status, 400);
  assertEquals(asked.length, 0);
});
Deno.test('no account: found false', async () => {
  assertEquals(await (await run(post({ email: 'a@b.co' }, 's3cret'), null)).json(), { found: false });
});
Deno.test('days done, the latest, and Day 14 as finished', async () => {
  const asked: string[] = [];
  const r = await run(post({ email: ' A@B.co ' }, 's3cret'), [
    { day_number: 1, quiz_passed_at: '2026-10-15T02:00:00Z' },
    { day_number: 2, quiz_passed_at: '2026-10-17T02:00:00Z' },
  ], asked);
  assertEquals(await r.json(), { found: true, days_done: 2, last_done_at: '2026-10-17T02:00:00Z', finished: false });
  assertEquals(asked, ['a@b.co']);
  const all = Array.from({ length: 14 }, (_, i) => ({ day_number: i + 1, quiz_passed_at: `2026-10-${String(10 + i).padStart(2, '0')}T02:00:00Z` }));
  assertEquals((await (await run(post({ email: 'a@b.co' }, 's3cret'), all)).json()).finished, true);
});
Deno.test('only POST', async () => {
  assertEquals((await run(new Request('https://x/fintern-progress', { method: 'GET', headers: { 'x-fintern-secret': 's3cret' } }), [])).status, 405);
});
