import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const dir=path.resolve(process.env.IIG_AUDIT_DIR||"./var/audit");
const file=path.join(dir,"audit.ndjson");
export async function audit(event){
  await fs.mkdir(dir,{recursive:true});
  const rec={id:crypto.randomUUID(),ts:new Date().toISOString(),...event};
  await fs.appendFile(file,JSON.stringify(rec)+"\n",{mode:0o600});
  return rec;
}
export async function recentAudit(limit=100){
  try{
    const raw=await fs.readFile(file,"utf8"),rows=raw.trim().split(/\n+/).filter(Boolean).slice(-Math.max(1,Math.min(1000,Number(limit)||100))).map(x=>JSON.parse(x)).reverse();
    return rows;
  }catch(e){if(e.code==="ENOENT")return [];throw e}
}
