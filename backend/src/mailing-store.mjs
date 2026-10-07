import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const dir=path.resolve(process.env.IIG_MAILING_DIR||"./var/mailing");
const file=path.join(dir,"campaigns.json");
let mutation=Promise.resolve();

const empty=()=>({schema:"iig.mailing.v1",campaigns:[],validated_digests:{}});
async function read(){
  try{
    const x=JSON.parse(await fs.readFile(file,"utf8"));
    if(!Array.isArray(x.campaigns))x.campaigns=[];
    if(!x.validated_digests||typeof x.validated_digests!=="object")x.validated_digests={};
    return x;
  }catch(e){if(e.code==="ENOENT")return empty();throw e}
}
async function write(db){
  await fs.mkdir(dir,{recursive:true});
  const tmp=file+".tmp";
  await fs.writeFile(tmp,JSON.stringify(db,null,2)+"\n",{mode:0o600});
  await fs.rename(tmp,file);
}
async function mutate(fn){
  let resolveOuter,rejectOuter;
  const outer=new Promise((res,rej)=>{resolveOuter=res;rejectOuter=rej});
  mutation=mutation.then(async()=>{try{const db=await read(),result=await fn(db);await write(db);resolveOuter(result)}catch(e){rejectOuter(e)}}).catch(()=>{});
  return outer;
}
const normLang=v=>String(v||"UA").toUpperCase()==="EN"?"EN":"UA";
const campaignId=()=>("CMP-"+Date.now().toString(36)+"-"+crypto.randomBytes(3).toString("hex")).toUpperCase();

export async function saveValidatedDigest(language,record){
  const lang=normLang(language);
  return mutate(db=>{
    db.validated_digests[lang]={...record,language:lang,validated_at:new Date().toISOString()};
    return structuredClone(db.validated_digests[lang]);
  });
}
export async function getValidatedDigest(language){
  const db=await read();return structuredClone(db.validated_digests[normLang(language)]||null);
}
export async function beginCampaign(meta){
  return mutate(db=>{
    const rec={id:campaignId(),status:"RUNNING",created_at:new Date().toISOString(),completed_at:null,total:0,sent:0,failed:0,skipped:0,failures:[],...meta};
    db.campaigns.push(rec);return structuredClone(rec);
  });
}
export async function completeCampaign(id,patch){
  return mutate(db=>{
    const rec=db.campaigns.find(x=>x.id===id);if(!rec)throw new Error("CAMPAIGN_NOT_FOUND");
    Object.assign(rec,patch,{completed_at:new Date().toISOString()});return structuredClone(rec);
  });
}
export async function listCampaigns(){
  const db=await read();return structuredClone(db.campaigns.slice().reverse());
}
