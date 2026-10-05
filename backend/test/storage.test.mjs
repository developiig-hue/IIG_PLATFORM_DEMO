import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

test("revision is deterministic",async()=>{
  process.env.IIG_DIGEST_LOCAL_DIR=await fs.mkdtemp(path.join(os.tmpdir(),"iig-digest-"));
  const {revisionFor,sha256}=await import("../src/storage.mjs?test="+Date.now());
  const b=Buffer.from("%PDF-1.7\nIIG");
  assert.equal(revisionFor(b),sha256(b).slice(0,16));
});
