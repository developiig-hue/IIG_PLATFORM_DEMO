import fs from "node:fs/promises";
import path from "node:path";

const dir=path.resolve(process.env.IIG_DIGEST_LOCAL_DIR||"./data/digest");
const file=path.join(dir,"approval.json");

export async function saveApproval(record){
  await fs.mkdir(dir,{recursive:true});
  const tmp=path.join(dir,`.approval.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tmp,JSON.stringify(record,null,2),{flag:"wx"});
  await fs.rename(tmp,file);
}
export async function getApproval(){
  try{return JSON.parse(await fs.readFile(file,"utf8"))}
  catch(e){if(e.code==="ENOENT")return null;throw e}
}
