import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";

test("ADMIN_2 import merges contacts and preserves unsubscribe suppression",async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),"iig-contact-import-"));
  process.env.IIG_REQUESTS_DIR=dir;
  const store=await import("../src/request-store.mjs?contact-import="+Date.now());
  await assert.rejects(
    store.importContactsBase([{email:"role@example.com",name:"Role",consent:"yes"}],"ADMIN_1","test.xlsx"),
    e=>e.code==="ADMIN_2_REQUIRED"
  );
  let result=await store.importContactsBase([
    {email:"active@example.com",name:"Active",company:"IIG",language:"UA",status:"ACTIVE",consent:"yes",consent_evidence:"website subscribe"},
    {email:"pending@example.com",name:"Pending",company:"IIG",language:"EN",status:"PENDING"},
    {email:"bad-email",name:"Invalid"}
  ],"ADMIN_2","test.xlsx");
  assert.equal(result.added,2);
  assert.equal(result.invalid,1);
  let rows=await store.listContacts();
  assert.equal(rows.find(x=>x.email==="active@example.com").status,"ACTIVE");
  assert.equal(rows.find(x=>x.email==="pending@example.com").status,"PENDING");

  const active=rows.find(x=>x.email==="active@example.com");
  await store.markUnsubscribed(active.id,{source:"test"});
  result=await store.importContactsBase([
    {email:"active@example.com",name:"Updated",status:"ACTIVE",consent:"yes",consent_evidence:"offline master"}
  ],"ADMIN_2","updated.xlsx");
  rows=await store.listContacts();
  const suppressed=rows.find(x=>x.email==="active@example.com");
  assert.equal(suppressed.status,"SUPPRESSED");
  assert.equal(suppressed.marketing_consent,false);
  assert.ok(suppressed.unsubscribed_at);
  assert.equal(result.preserved_suppressed,1);
});
