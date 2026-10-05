// deno test supabase/functions/create-fintern-account/handler.test.ts
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { handle, sameSecret, STARTER_PASSWORD, type Admin } from "./handler.ts";

function fakeAdmin(opts: { exists?: boolean; tierFails?: boolean; profileId?: string } = {}) {
  const calls: { op: string; table?: string; row: Record<string, unknown>; opts?: Record<string, unknown> }[] = [];
  const admin: Admin = {
    auth: { admin: { createUser: async (a) => {
      calls.push({ op: 'createUser', row: a });
      return opts.exists
        ? { data: { user: null }, error: { message: 'A user with this email address has already been registered', code: 'email_exists' } }
        : { data: { user: { id: 'u1' } }, error: null };
    } } },
    from: (table) => ({
      insert: (row) => { calls.push({ op: 'insert', table, row }); return Promise.resolve({ error: null }); },
      upsert: (row, o) => { calls.push({ op: 'upsert', table, row, opts: o }); return Promise.resolve({ error: opts.tierFails ? { message: 'boom' } : null }); },
      select: () => ({ eq: (_c, v) => ({ maybeSingle: () => {
        calls.push({ op: 'select', table, row: { email: v } });
        return Promise.resolve({ data: opts.profileId ? { user_id: opts.profileId } : null, error: null });
      } }) }),
    }),
  };
  return { admin, calls };
}
const post = (body: unknown, secret?: string) => new Request('https://x/create-fintern-account', {
  method: 'POST', body: JSON.stringify(body), headers: secret === undefined ? {} : { 'x-fintern-secret': secret },
});

Deno.test('no secret configured refuses everything', async () => {
  const f = fakeAdmin();
  const r = await handle(post({ email: 'a@b.co' }, ''), { secret: '', admin: () => f.admin });
  assertEquals(r.status, 401); assertEquals(f.calls.length, 0);
});
Deno.test('a wrong or missing secret is refused', async () => {
  const f = fakeAdmin();
  assertEquals((await handle(post({ email: 'a@b.co' }, 'nope'), { secret: 's3cret', admin: () => f.admin })).status, 401);
  assertEquals((await handle(post({ email: 'a@b.co' }), { secret: 's3cret', admin: () => f.admin })).status, 401);
  assertEquals(f.calls.length, 0);
});
Deno.test('a bad email is refused before anything is written', async () => {
  const f = fakeAdmin();
  const r = await handle(post({ email: 'not an email' }, 's3cret'), { secret: 's3cret', admin: () => f.admin });
  assertEquals(r.status, 400); assertEquals(f.calls.length, 0);
});
Deno.test('a new FINtern: explorer tier, the starter password, the caller cannot choose either', async () => {
  const f = fakeAdmin();
  const r = await handle(post({ email: ' Shreyaa@Example.com ', name: 'Shreyaa  Rao', password: 'evil', tier: 'post_rnf' }, 's3cret'), { secret: 's3cret', admin: () => f.admin });
  assertEquals(await r.json(), { created: true });
  const made = f.calls.find((c) => c.op === 'createUser')!.row;
  assertEquals(made.email, 'shreyaa@example.com');
  assertEquals(made.password, STARTER_PASSWORD);
  assertEquals(made.email_confirm, true);
  assertEquals(f.calls.find((c) => c.table === 'user_access_tiers')!.row, { user_id: 'u1', tier_level: 'explorer' });
  assertEquals(f.calls.find((c) => c.table === 'profiles')!.row.first_name, 'Shreyaa');
});
Deno.test('an existing account keeps its password and any tier it has', async () => {
  const f = fakeAdmin({ exists: true, profileId: 'u9' });
  const r = await handle(post({ email: 'A@B.co', name: 'A' }, 's3cret'), { secret: 's3cret', admin: () => f.admin });
  assertEquals(await r.json(), { created: false, exists: true });
  // Found by its lowercased email; the only write is a tier that does nothing on conflict.
  assertEquals(f.calls.find((c) => c.op === 'select')!.row, { email: 'a@b.co' });
  const writes = f.calls.filter((c) => c.op === 'insert' || c.op === 'upsert');
  assertEquals(writes.length, 1);
  assertEquals(writes[0].table, 'user_access_tiers');
  assertEquals(writes[0].row, { user_id: 'u9', tier_level: 'explorer' });
  assertEquals(writes[0].opts, { onConflict: 'user_id', ignoreDuplicates: true });
  assertEquals(f.calls.filter((c) => c.op === 'createUser').length, 1);
});
Deno.test('an existing account with no profile row writes nothing', async () => {
  const f = fakeAdmin({ exists: true });
  const r = await handle(post({ email: 'a@b.co' }, 's3cret'), { secret: 's3cret', admin: () => f.admin });
  assertEquals(await r.json(), { created: false, exists: true });
  assertEquals(f.calls.filter((c) => c.op === 'insert' || c.op === 'upsert').length, 0);
});
Deno.test('only POST', async () => {
  const f = fakeAdmin();
  const r = await handle(new Request('https://x/create-fintern-account', { method: 'GET', headers: { 'x-fintern-secret': 's3cret' } }), { secret: 's3cret', admin: () => f.admin });
  assertEquals(r.status, 405); assertEquals(f.calls.length, 0);
});
Deno.test('a body that is not JSON is a bad request, not a crash', async () => {
  const f = fakeAdmin();
  const r = await handle(new Request('https://x/create-fintern-account', { method: 'POST', body: 'not json', headers: { 'x-fintern-secret': 's3cret' } }), { secret: 's3cret', admin: () => f.admin });
  assertEquals(r.status, 400); assertEquals(f.calls.length, 0);
});
Deno.test('a very long name is cut to 100 characters', async () => {
  const f = fakeAdmin();
  await handle(post({ email: 'a@b.co', name: 'x'.repeat(500) }, 's3cret'), { secret: 's3cret', admin: () => f.admin });
  const meta = f.calls.find((c) => c.op === 'createUser')!.row.user_metadata as { display_name: string };
  assertEquals(meta.display_name.length, 100);
});
Deno.test('an email with spaces inside is refused', async () => {
  const f = fakeAdmin();
  assertEquals((await handle(post({ email: 'a b@c.co' }, 's3cret'), { secret: 's3cret', admin: () => f.admin })).status, 400);
});
Deno.test('a tier that cannot be set is an error, not a silent success', async () => {
  const f = fakeAdmin({ tierFails: true });
  assertEquals((await handle(post({ email: 'a@b.co' }, 's3cret'), { secret: 's3cret', admin: () => f.admin })).status, 500);
});
Deno.test('sameSecret', () => {
  assertEquals(sameSecret('abc', 'abc'), true);
  assertEquals(sameSecret('abc', 'abd'), false);
  assertEquals(sameSecret('abc', 'abcd'), false);
  assertEquals(sameSecret('', ''), true);
});
