import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const dir=path.resolve(process.env.IIG_MAILING_DIR||"./var/mailing");
const file=path.join(dir,"campaigns.json");
let mutation=Promise.resolve();

const DEFAULT_TEMPLATES={
 UA:{
   language:"UA",
   subject:"IIG Monthly Digest — промислова енергетика | [Місяць, рік]",
   html:'<p>{{greeting}}</p><p>Дякуємо за підписку на <b>IIG Monthly Digest</b>. У вкладенні — актуальний випуск, попередньо затверджений ADMIN_1.</p><p>Сподіваємося, що добірка новин промислової енергетики, фінансування та інженерних матеріалів буде корисною у Вашій роботі.</p><p>З повагою,<br><b>IIG — Industry Intelligence Generation</b></p>',
   approved_default:true
 },
 EN:{
   language:"EN",
   subject:"IIG Monthly Digest — Industrial Energy Intelligence | [Month, Year]",
   html:'<p>{{greeting}}</p><p>Thank you for subscribing to <b>IIG Monthly Digest</b>. Please find the latest ADMIN_1-approved issue attached.</p><p>We hope the selected industrial energy, financing and engineering updates are useful for your work.</p><p>Best regards,<br><b>IIG — Industry Intelligence Generation</b></p>',
   approved_default:true
 }
};
const empty=()=>({schema:"iig.mailing.v2",campaigns:[],validated_digests:{},templates:structuredClone(DEFAULT_TEMPLATES)});
async function read(){
  try{
    const x=JSON.parse(await fs.readFile(file,"utf8"));
    if(!Array.isArray(x.campaigns))x.campaigns=[];
    if(!x.validated_digests||typeof x.validated_digests!=="object")x.validated_digests={};
    if(!x.templates||typeof x.templates!=="object")x.templates=structuredClone(DEFAULT_TEMPLATES);
    for(const lang of ["UA","EN"])if(!x.templates[lang])x.templates[lang]=structuredClone(DEFAULT_TEMPLATES[lang]);
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


export async function getMailTemplate(language){
  const db=await read(),lang=normLang(language);
  return structuredClone(db.templates?.[lang]||DEFAULT_TEMPLATES[lang]);
}
export async function saveMailTemplate(language,record,role){
  const lang=normLang(language);
  if(!["ADMIN_1","ADMIN_2"].includes(role))throw Object.assign(new Error("ADMIN_ROLE_REQUIRED"),{code:"ADMIN_ROLE_REQUIRED"});
  return mutate(db=>{
    db.templates=db.templates||structuredClone(DEFAULT_TEMPLATES);
    db.templates[lang]={
      language:lang,
      subject:String(record.subject||DEFAULT_TEMPLATES[lang].subject).slice(0,240),
      html:String(record.html||DEFAULT_TEMPLATES[lang].html).slice(0,20000),
      updated_by:role,
      updated_at:new Date().toISOString(),
      approved_default:false
    };
    return structuredClone(db.templates[lang]);
  });
}
export async function resetMailTemplate(language,role){
  const lang=normLang(language);
  if(!["ADMIN_1","ADMIN_2"].includes(role))throw Object.assign(new Error("ADMIN_ROLE_REQUIRED"),{code:"ADMIN_ROLE_REQUIRED"});
  return mutate(db=>{
    db.templates=db.templates||{};
    db.templates[lang]={...structuredClone(DEFAULT_TEMPLATES[lang]),updated_by:role,updated_at:new Date().toISOString()};
    return structuredClone(db.templates[lang]);
  });
}
