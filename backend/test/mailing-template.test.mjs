import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";

test("UA and EN mailing templates are independent and resettable",async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),"iig-mail-template-"));
  process.env.IIG_MAILING_DIR=dir;
  const store=await import("../src/mailing-store.mjs?templates="+Date.now());
  const ua=await store.getMailTemplate("UA");
  const en=await store.getMailTemplate("EN");
  assert.match(ua.subject,/промислова енергетика/i);
  assert.match(en.subject,/Industrial Energy/i);
  const changed=await store.saveMailTemplate("EN",{subject:"Custom EN",html:"<p>{{greeting}}</p><p><b>Custom</b> text for Digest.</p>"},"ADMIN_2");
  assert.equal(changed.updated_by,"ADMIN_2");
  assert.equal((await store.getMailTemplate("UA")).subject,ua.subject);
  assert.equal((await store.getMailTemplate("EN")).subject,"Custom EN");
  const reset=await store.resetMailTemplate("EN","ADMIN_2");
  assert.match(reset.subject,/Industrial Energy/i);
});
