import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const dir=path.resolve(process.env.IIG_REQUESTS_DIR||"./var/requests");
const file=path.join(dir,"registry.json");
let mutation=Promise.resolve();

const empty=()=>({schema:"iig.requests-registry.v1",created_at:new Date().toISOString(),requests:[],contacts:[]});
const clean=v=>String(v??"").replace(/[\u0000-\u001F\u007F]/g," ").replace(/\s+/g," ").trim();
const email=v=>clean(v).toLowerCase();
const typeOf=v=>["project","subscribe","engineer"].includes(String(v||"").toLowerCase())?String(v).toLowerCase():"";
const idFor=type=>({project:"PRJ",subscribe:"SUB",engineer:"ENG"}[type]||"REQ")+"-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomBytes(3).toString("hex").toUpperCase();

async function read(){
  try{
    const x=JSON.parse(await fs.readFile(file,"utf8"));
    if(!Array.isArray(x.requests))x.requests=[];
    if(!Array.isArray(x.contacts))x.contacts=[];
    return x;
  }catch(e){
    if(e.code==="ENOENT")return empty();
    throw e;
  }
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
function publicFields(body,type){
  const common={
    name:clean(body.name).slice(0,160),
    company:clean(body.company).slice(0,220),
    email:email(body.email).slice(0,254),
    language:String(body.language||"UA").toUpperCase()==="EN"?"EN":"UA",
    consent_text:clean(body.consent_text).slice(0,500),
    consent:true
  };
  if(type==="project")return {...common,phone:clean(body.phone).slice(0,80),industry:clean(body.industry).slice(0,120),solution:clean(body.solution).slice(0,120),message:clean(body.message).slice(0,5000)};
  if(type==="engineer")return {...common,position:clean(body.position).slice(0,160),message:clean(body.message).slice(0,5000)};
  return {...common};
}
export function validateSubmission(body={}){
  const type=typeOf(body.type);
  if(!type)return {ok:false,error:"INVALID_TYPE"};
  if(body.website)return {ok:false,error:"BOT_REJECTED"};
  const x=publicFields(body,type);
  if(x.name.length<2||x.company.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email))return {ok:false,error:"REQUIRED_FIELDS"};
  if(body.consent!==true)return {ok:false,error:"CONSENT_REQUIRED"};
  if((type==="project"||type==="engineer")&&x.message.length<5)return {ok:false,error:"MESSAGE_REQUIRED"};
  return {ok:true,type,item:x};
}
export async function createRequest(body,meta={}){
  const v=validateSubmission(body);if(!v.ok)throw Object.assign(new Error(v.error),{code:v.error});
  return mutate(db=>{
    const now=new Date().toISOString();
    const r={id:idFor(v.type),type:v.type,received_at:now,status:"NEW",downloaded_at:null,downloaded_by:null,processed_at:null,processed_by:null,promoted_at:null,promoted_by:null,source:"IIG_PUBLIC_FORM",ip_hash:meta.ip_hash||"",user_agent:clean(meta.user_agent).slice(0,300),...v.item};
    db.requests.push(r);return structuredClone(r);
  });
}
const statsFor=(arr)=>({total:arr.length,new:arr.filter(x=>!x.processed_at).length,downloaded:arr.filter(x=>!!x.downloaded_at).length,processed:arr.filter(x=>!!x.processed_at).length,promoted:arr.filter(x=>!!x.promoted_at).length});
export async function listRequests(type=""){
  const db=await read(),t=typeOf(type),rows=(t?db.requests.filter(x=>x.type===t):db.requests).slice().sort((a,b)=>String(b.received_at).localeCompare(String(a.received_at)));
  return {rows,stats:t?statsFor(rows):{all:statsFor(db.requests),project:statsFor(db.requests.filter(x=>x.type==="project")),subscribe:statsFor(db.requests.filter(x=>x.type==="subscribe")),engineer:statsFor(db.requests.filter(x=>x.type==="engineer"))}};
}
export async function markDownloaded(type,role){
  const t=typeOf(type);if(!t)throw Object.assign(new Error("INVALID_TYPE"),{code:"INVALID_TYPE"});
  return mutate(db=>{const now=new Date().toISOString(),rows=db.requests.filter(x=>x.type===t);for(const r of rows){if(!r.downloaded_at){r.downloaded_at=now;r.downloaded_by=role}}return {rows:structuredClone(rows),downloaded_at:now}});
}
export async function markProcessed(id,role,processed=true){
  return mutate(db=>{
    const r=db.requests.find(x=>x.id===id);if(!r)throw Object.assign(new Error("NOT_FOUND"),{code:"NOT_FOUND"});
    if(processed&&!r.downloaded_at)throw Object.assign(new Error("DOWNLOAD_REQUIRED"),{code:"DOWNLOAD_REQUIRED"});
    if(processed){r.processed_at=new Date().toISOString();r.processed_by=role;r.status="PROCESSED"}else{r.processed_at=null;r.processed_by=null;r.status="NEW"}
    return structuredClone(r);
  });
}
export async function promoteContact(id,role){
  return mutate(db=>{
    const r=db.requests.find(x=>x.id===id);if(!r)throw Object.assign(new Error("NOT_FOUND"),{code:"NOT_FOUND"});
    if(!r.processed_at)throw Object.assign(new Error("PROCESSING_REQUIRED"),{code:"PROCESSING_REQUIRED"});
    let c=db.contacts.find(x=>x.email===r.email);
    const marketing=r.type==="subscribe";
    if(!c){c={id:"CNT-"+crypto.randomBytes(6).toString("hex").toUpperCase(),email:r.email,name:r.name,company:r.company,position:r.position||"",language:r.language||"UA",status:marketing?"ACTIVE":"PENDING",marketing_consent:marketing,source_request_ids:[r.id],created_at:new Date().toISOString()};db.contacts.push(c)}
    else{if(!c.source_request_ids.includes(r.id))c.source_request_ids.push(r.id);c.name=r.name||c.name;c.company=r.company||c.company;if(marketing){c.status="ACTIVE";c.marketing_consent=true}}
    r.promoted_at=new Date().toISOString();r.promoted_by=role;
    return {request:structuredClone(r),contact:structuredClone(c)};
  });
}
export async function lifetimeStats(){const db=await read();return {all:statsFor(db.requests),project:statsFor(db.requests.filter(x=>x.type==="project")),subscribe:statsFor(db.requests.filter(x=>x.type==="subscribe")),engineer:statsFor(db.requests.filter(x=>x.type==="engineer")),contacts:db.contacts.length}}


export async function listContacts(){
  const db=await read();
  return structuredClone(db.contacts.slice().sort((a,b)=>String(a.email).localeCompare(String(b.email))));
}

export async function getContactById(id){
  const db=await read();
  const c=db.contacts.find(x=>x.id===id);
  return c?structuredClone(c):null;
}

export async function markUnsubscribed(id,meta={}){
  return mutate(db=>{
    const c=db.contacts.find(x=>x.id===id);
    if(!c)throw Object.assign(new Error("CONTACT_NOT_FOUND"),{code:"CONTACT_NOT_FOUND"});
    c.status="SUPPRESSED";
    c.marketing_consent=false;
    c.unsubscribed_at=new Date().toISOString();
    c.unsubscribe_reason=clean(meta.reason||"USER_REQUEST").slice(0,120);
    c.unsubscribe_source=clean(meta.source||"email_link").slice(0,120);
    return structuredClone(c);
  });
}

export async function mailingEligibleContacts(){
  const db=await read();
  return structuredClone(db.contacts.filter(x=>x.status==="ACTIVE"&&x.marketing_consent===true&&!x.unsubscribed_at));
}
