import Fastify from "fastify";
import multipart from "@fastify/multipart";
import formbody from "@fastify/formbody";
import {requireAdmin} from "./auth.mjs";
import {putCurrent,getCurrentMeta,getCurrentPdf,revisionFor,sha256} from "./storage.mjs";
import {saveApproval,getApproval} from "./approval-store.mjs";
import {verifyPdfLinks} from "./pdf-links.mjs";
import {createRequest,listRequests,markDownloaded,markProcessed,promoteContact,lifetimeStats,listContacts,getContactById,markUnsubscribed,mailingEligibleContacts,importContactsBase} from "./request-store.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import * as XLSX from "xlsx";
import {saveValidatedDigest,getValidatedDigest,beginCampaign,completeCampaign,listCampaigns,getMailTemplate,saveMailTemplate,resetMailTemplate} from "./mailing-store.mjs";

const app=Fastify({logger:true,bodyLimit:30*1024*1024});
await app.register(multipart,{limits:{fileSize:25*1024*1024,files:1,fields:8}});
await app.register(formbody);
const normLang=v=>String(v||"UA").toUpperCase()==="EN"?"EN":"UA";
const editorialDraftDir=path.resolve(process.env.IIG_EDITORIAL_DRAFT_DIR||"./var/editorial-drafts");
const safeSlug=v=>String(v||"").toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,160);
async function saveEditorialDraft(slug,record){await fs.mkdir(editorialDraftDir,{recursive:true});const tmp=path.join(editorialDraftDir,slug+".tmp"),dst=path.join(editorialDraftDir,slug+".json");await fs.writeFile(tmp,JSON.stringify(record,null,2)+"\n",{mode:0o600});await fs.rename(tmp,dst)}


const EDITORIAL_REFRESH_REQUESTS=new Map();
const ghRepo=String(process.env.IIG_GITHUB_REPO||"developiig-hue/IIG_PLATFORM_DEMO");
const ghWorkflow=String(process.env.IIG_GITHUB_EDITORIAL_WORKFLOW||"editorial-refresh.yml");
const ghBranch=String(process.env.IIG_GITHUB_BRANCH||"main");
const ghToken=()=>String(process.env.IIG_GITHUB_ACTIONS_TOKEN||"").trim();
async function githubApi(path,options={}){
  const token=ghToken();if(!token)throw new Error("GITHUB_ACTIONS_TOKEN_NOT_CONFIGURED");
  const headers={"Accept":"application/vnd.github+json","Authorization":"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28","User-Agent":"IIG-Editorial-Backend"};
  Object.assign(headers,options.headers||{});
  const r=await fetch("https://api.github.com"+path,{method:options.method||"GET",headers,body:options.body});
  const txt=await r.text();let body=null;try{body=txt?JSON.parse(txt):null}catch{body=txt}
  if(!r.ok)throw new Error("GITHUB_API_"+r.status+":"+String((body&&body.message)||txt||"ERROR").slice(0,180));
  return {status:r.status,body};
}


const REQUEST_RATE=new Map();
function requestIp(req){return String(req.headers["x-forwarded-for"]||req.ip||"").split(",")[0].trim()}
function hashIp(ip){return crypto.createHash("sha256").update(String(ip||"")+"|"+String(process.env.IIG_REQUESTS_IP_SALT||"iig")).digest("hex").slice(0,32)}
function rateLimitPublic(req){
  const key=requestIp(req)||"unknown",now=Date.now(),windowMs=10*60*1000,limit=12;
  const xs=(REQUEST_RATE.get(key)||[]).filter(t=>now-t<windowMs);xs.push(now);REQUEST_RATE.set(key,xs);
  return xs.length<=limit;
}
function xmlEsc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function requestExcelXml(type,rows){
  const heads=["ID","Тип","Дата отримання","Ім’я","Компанія","E-mail","Телефон / Посада","Галузь / Мова","Технологія","Текст звернення","Згода","Завантажено","Завантажив","Оброблено","Обробив","Передано до бази IIG"];
  const cell=v=>'<Cell><Data ss:Type="String">'+xmlEsc(v)+'</Data></Cell>';
  const tr=a=>'<Row>'+a.map(cell).join("")+'</Row>';
  const body=rows.map(x=>tr([x.id,x.type,x.received_at,x.name,x.company,x.email,x.phone||x.position||"",x.industry||x.language||"",x.solution||"",x.message||"",x.consent_text||"",x.downloaded_at||"",x.downloaded_by||"",x.processed_at||"",x.processed_by||"",x.promoted_at||""])).join("");
  return '<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="'+xmlEsc(type)+'"><Table>'+tr(heads)+body+'</Table></Worksheet></Workbook>';
}
const allowedOrigins=new Set(String(process.env.IIG_ALLOWED_ORIGINS||"").split(",").map(x=>x.trim()).filter(Boolean));
app.addHook("onRequest",async(req,reply)=>{
  const origin=req.headers.origin;
  if(origin && allowedOrigins.size && !allowedOrigins.has(origin))return reply.code(403).send({error:"ORIGIN_NOT_ALLOWED"});
  if(origin && allowedOrigins.has(origin)){
    reply.header("Access-Control-Allow-Origin",origin);
    reply.header("Vary","Origin");
    reply.header("Access-Control-Allow-Credentials","true");
  }
  if(req.method==="OPTIONS"){
    reply.header("Access-Control-Allow-Methods","GET,HEAD,POST,OPTIONS");
    reply.header("Access-Control-Allow-Headers","Authorization,Content-Type,X-IIG-Admin-Role,X-IIG-Admin-Action,X-IIG-Digest-Revision,X-IIG-Digest-Issue,X-IIG-Digest-Fingerprint");
    return reply.code(204).send();
  }
});

app.get("/healthz",async()=>({ok:true,service:"iig-digest-publication-service"}));

app.post("/api/v1/requests",async(req,reply)=>{
  if(!rateLimitPublic(req))return reply.code(429).send({error:"RATE_LIMIT"});
  try{
    const item=await createRequest(req.body||{},{ip_hash:hashIp(requestIp(req)),user_agent:req.headers["user-agent"]||""});
    reply.header("Cache-Control","no-store");
    return reply.code(201).send({status:"RECEIVED",id:item.id,type:item.type,received_at:item.received_at});
  }catch(e){
    const code=e.code||e.message||"INVALID_REQUEST";
    const status=code==="BOT_REJECTED"?400:422;
    return reply.code(status).send({error:code});
  }
});
app.get("/api/v1/requests",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  const out=await listRequests(String(req.query?.type||""));
  reply.header("Cache-Control","no-store");return out;
});
app.get("/api/v1/requests/stats",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  reply.header("Cache-Control","no-store");return await lifetimeStats();
});
app.get("/api/v1/requests/export/:type.xls",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  const type=String(req.params?.type||"").toLowerCase();
  try{
    const out=await markDownloaded(type,role),xml=requestExcelXml(type,out.rows);
    reply.header("Content-Type","application/vnd.ms-excel; charset=utf-8");
    reply.header("Content-Disposition",'attachment; filename="IIG_'+type+'_requests_'+new Date().toISOString().slice(0,10)+'.xls"');
    reply.header("Cache-Control","no-store");
    return reply.send(xml);
  }catch(e){return reply.code(e.code==="INVALID_TYPE"?400:500).send({error:e.code||"EXPORT_FAILED"})}
});
app.post("/api/v1/requests/:id/processed",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  if(role!=="ADMIN_2")return reply.code(403).send({error:"ADMIN_2_REQUIRED"});
  try{return await markProcessed(String(req.params.id||""),role,req.body?.processed!==false)}
  catch(e){return reply.code(e.code==="DOWNLOAD_REQUIRED"?409:e.code==="NOT_FOUND"?404:400).send({error:e.code||"PROCESSING_FAILED"})}
});
app.post("/api/v1/requests/:id/promote-contact",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  if(role!=="ADMIN_2")return reply.code(403).send({error:"ADMIN_2_REQUIRED"});
  try{return await promoteContact(String(req.params.id||""),role)}
  catch(e){return reply.code(e.code==="PROCESSING_REQUIRED"?409:e.code==="NOT_FOUND"?404:400).send({error:e.code||"PROMOTE_FAILED"})}
});


app.post("/api/v1/digest/approvals",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  if(role!=="ADMIN_1")return reply.code(403).send({error:"ADMIN_1_REQUIRED"});
  const body=req.body||{},issue=String(body.issue||""),fingerprint=String(body.fingerprint||""),language=normLang(body.language);
  if(!/^\d{4}-\d{2}$/.test(issue)||fingerprint.length<8)return reply.code(400).send({error:"INVALID_APPROVAL"});
  const record={schema:"iig.digest-server-approval.v2",issue,language,fingerprint,preview_fingerprint:String(body.preview_fingerprint||fingerprint),approved_by:"ADMIN_1",approved_at:new Date().toISOString(),revision:Number(body.revision||0)};
  await saveApproval(record);
  return {status:"APPROVED",...record};
});

app.post("/api/v1/digest/releases",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  let pdf=null,meta=null;
  for await(const part of req.parts()){
    if(part.type==="file"){
      if(part.fieldname==="pdf")pdf=await part.toBuffer();
      else if(part.fieldname==="metadata"){try{meta=JSON.parse((await part.toBuffer()).toString("utf8"))}catch{}}
    }else if(part.fieldname==="metadata"){try{meta=JSON.parse(part.value)}catch{}}
  }
  meta=meta||{};
  const issue=String(meta.issue||req.headers["x-iig-digest-issue"]||""),fingerprint=String(meta.fingerprint||req.headers["x-iig-digest-fingerprint"]||""),language=normLang(meta.language);
  if(!pdf||pdf.length<5||pdf.subarray(0,5).toString()!=="%PDF-")return reply.code(400).send({error:"VALID_PDF_REQUIRED"});
  if(!/^\d{4}-\d{2}$/.test(issue)||fingerprint.length<8)return reply.code(400).send({error:"ISSUE_AND_FINGERPRINT_REQUIRED"});

  const approval=await getApproval(language);
  if(!approval||approval.issue!==issue||approval.language!==language||approval.fingerprint!==fingerprint||approval.approved_by!=="ADMIN_1")return reply.code(409).send({error:"ADMIN1_APPROVAL_RECEIPT_MISMATCH"});

  const expectedLinks=Array.isArray(meta.iig_links)?meta.iig_links:[],linkCheck=await verifyPdfLinks(pdf,expectedLinks);
  if(!linkCheck.links_preserved)return reply.code(422).send({error:"PDF_LINK_VERIFICATION_FAILED",link_count:linkCheck.link_count,missing_links:linkCheck.missing_links});

  const revision=revisionFor(pdf),hash=sha256(pdf),publicBase=String(process.env.PUBLIC_BASE_URL||"").replace(/\/$/,""),fileName=language==="EN"?"current-en.pdf":"current.pdf";
  const publicUrl=(publicBase?publicBase:"")+"/digest/"+fileName;
  const record={schema:"iig.digest-current.v2",status:"CURRENT",issue,language,fingerprint,approved_by:"ADMIN_1",approved_at:approval.approved_at,uploaded_by:role,published_at:new Date().toISOString(),revision,sha256:hash,bytes:pdf.length,public_url:publicUrl,links_preserved:true,link_count:linkCheck.link_count,previous_current_deleted:true};
  await putCurrent(pdf,record);
  reply.header("Cache-Control","no-store");
  return record;
});



const IIG_MAILING_V1=true;
const unsubscribeSecret=()=>String(process.env.IIG_UNSUBSCRIBE_SECRET||"").trim();
const publicBaseUrl=()=>String(process.env.PUBLIC_BASE_URL||"").replace(/\/$/,"");
function b64url(v){return Buffer.from(v).toString("base64url")}
function unsubscribeToken(contact){
  const secret=unsubscribeSecret();if(!secret)throw new Error("UNSUBSCRIBE_SECRET_NOT_CONFIGURED");
  const payload=JSON.stringify({cid:contact.id,exp:Date.now()+365*24*3600*1000});
  const p=b64url(payload),sig=crypto.createHmac("sha256",secret).update(p).digest("base64url");
  return p+"."+sig;
}
function verifyUnsubscribeToken(token){
  const [p,s]=String(token||"").split(".");if(!p||!s||!unsubscribeSecret())return null;
  const expected=crypto.createHmac("sha256",unsubscribeSecret()).update(p).digest("base64url");
  const A=Buffer.from(s),B=Buffer.from(expected);if(A.length!==B.length||!crypto.timingSafeEqual(A,B))return null;
  try{const data=JSON.parse(Buffer.from(p,"base64url").toString("utf8"));if(!data.cid||Number(data.exp)<Date.now())return null;return data}catch{return null}
}
function smtpTransport(){
  const host=String(process.env.IIG_SMTP_HOST||"").trim(),user=String(process.env.IIG_SMTP_USER||"").trim(),pass=String(process.env.IIG_SMTP_PASS||"");
  if(!host||!user||!pass)return null;
  return nodemailer.createTransport({
    host,
    port:Number(process.env.IIG_SMTP_PORT||587),
    secure:String(process.env.IIG_SMTP_SECURE||"false").toLowerCase()==="true",
    auth:{user,pass}
  });
}
function mailingFrom(){return String(process.env.IIG_MAIL_FROM||"").trim()}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
function sanitizeMailHtml(v){
  let h=String(v||"").slice(0,20000);
  if(/<\s*(script|style|iframe|object|embed|svg|math|form|input|button)\b/i.test(h))throw Object.assign(new Error("UNSAFE_MAIL_HTML"),{code:"UNSAFE_MAIL_HTML"});
  if(/\son\w+\s*=|javascript:|data:text\/html/i.test(h))throw Object.assign(new Error("UNSAFE_MAIL_HTML"),{code:"UNSAFE_MAIL_HTML"});
  h=h.replace(/<a\b([^>]*)>/gi,(m,attrs)=>{
    const hit=attrs.match(/href\s*=\s*["']([^"']+)["']/i),href=hit?hit[1]:"";
    if(!/^(https?:\/\/|mailto:)/i.test(href))return "";
    return '<a href="'+escapeHtml(href)+'">';
  });
  return h;
}
function plainTextFromHtml(h){return String(h||"").replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n\n").replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\n{3,}/g,"\n\n").trim()}
function contactName(contact,language){
  const n=String(contact.name||"").trim();
  if(n)return escapeHtml(n);
  return language==="EN"?"colleague":"колего";
}
function fallbackGreeting(contact,language){
  return language==="EN"?"Dear "+contactName(contact,language)+"!":"Шановний "+contactName(contact,language)+" !";
}
async function messageFor(contact,language,unsubscribeUrl){
  const lang=normLang(language),template=await getMailTemplate(lang),name=contactName(contact,lang),greeting=fallbackGreeting(contact,lang);
  let html=sanitizeMailHtml(template.html||"");
  html=html.replaceAll("{{name}}",name).replaceAll("{{greeting}}",greeting);
  if(!/Шановний|Dear/i.test(plainTextFromHtml(html)))html="<p><b>"+greeting+"</b></p>"+html;
  const unsubLabel=lang==="EN"?"UNSUBSCRIBE FROM MAILING":"ВІДПИСАТИСЯ ВІД РОЗСИЛКИ";
  const personal='<a href="'+escapeHtml(unsubscribeUrl)+'">'+unsubLabel+"</a>";
  html=html.replace(/<a\b[^>]*href\s*=\s*["']mailto:[^"']+["'][^>]*>\s*ВІДПИСАТИСЯ ВІД РОЗСИЛКИ\s*<\/a>/gi,personal);
  if(!html.includes(unsubscribeUrl))html+='<p>'+personal+'</p>';
  const text=plainTextFromHtml(html)+(lang==="EN"?"\n\nUnsubscribe: ":"\n\nВідписатися: ")+unsubscribeUrl;
  return {subject:String(template.subject||"").slice(0,240),text,html,template_updated_at:template.updated_at||null};
}

function normalizedHeader(v){
  return String(v||"").trim().toLowerCase().replace(/[’']/g,"'").replace(/[^a-zа-яіїєґ0-9]+/gi,"_").replace(/^_+|_+$/g,"");
}
function contactImportRows(buffer,filename=""){
  const book=XLSX.read(buffer,{type:"buffer",raw:false});
  const sheet=book.Sheets[book.SheetNames[0]];
  const rows=XLSX.utils.sheet_to_json(sheet,{defval:"",raw:false});
  const aliases={
    "email":"email","e_mail":"email","e-mail":"email","електронна_пошта":"email",
    "ім_я":"name","імя":"name","name":"name","full_name":"name","контакт":"name",
    "компанія":"company","організація":"company","company":"company","organization":"company",
    "посада":"position","position":"position","role":"position",
    "мова":"language","language":"language","lang":"language",
    "джерело":"source","source":"source",
    "статус":"status","статус_розсилки":"status","status":"status",
    "згода":"consent","статус_згоди":"consent","consent":"consent","marketing_consent":"marketing_consent",
    "підтвердження_згоди":"consent_evidence","підтвердження":"consent_evidence","consent_evidence":"consent_evidence",
    "примітка":"note","note":"note"
  };
  return rows.map(row=>{
    const out={};
    for(const [k,v] of Object.entries(row)){
      const nk=normalizedHeader(k),key=aliases[nk]||nk;out[key]=v;
    }
    return out;
  }).filter(x=>Object.values(x).some(v=>String(v||"").trim()));
}

app.post("/api/v1/contacts/import",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  if(role!=="ADMIN_2")return reply.code(403).send({error:"ADMIN_2_REQUIRED"});
  let file=null,filename="";
  for await(const part of req.parts()){
    if(part.type==="file"&&part.fieldname==="file"){file=await part.toBuffer();filename=String(part.filename||"")}
  }
  if(!file||!file.length)return reply.code(400).send({error:"CONTACT_BASE_FILE_REQUIRED"});
  if(file.length>10*1024*1024)return reply.code(413).send({error:"CONTACT_BASE_TOO_LARGE"});
  if(!/\.(xlsx|xls|csv)$/i.test(filename))return reply.code(400).send({error:"CONTACT_BASE_FORMAT_UNSUPPORTED"});
  try{
    const rows=contactImportRows(file,filename);
    if(!rows.length)return reply.code(422).send({error:"CONTACT_BASE_EMPTY"});
    const result=await importContactsBase(rows,role,"ADMIN_2_UPLOAD:"+filename.slice(0,120));
    reply.header("Cache-Control","no-store");
    return result;
  }catch(e){
    req.log.error(e);
    return reply.code(e.code==="ADMIN_2_REQUIRED"?403:422).send({error:e.code||"CONTACT_BASE_IMPORT_FAILED"});
  }
});

app.get("/api/v1/mailing/template/:language",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  const language=normLang(req.params?.language);
  reply.header("Cache-Control","no-store");
  return await getMailTemplate(language);
});
app.post("/api/v1/mailing/template/:language",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  if(!["ADMIN_1","ADMIN_2"].includes(role))return reply.code(403).send({error:"ADMIN_ROLE_REQUIRED"});
  const language=normLang(req.params?.language),subject=String(req.body?.subject||"").trim(),html=String(req.body?.html||"");
  if(subject.length<3||subject.length>240)return reply.code(422).send({error:"MAIL_SUBJECT_REQUIRED"});
  if(html.length<20)return reply.code(422).send({error:"MAIL_BODY_REQUIRED"});
  try{
    const safe=sanitizeMailHtml(html);
    const saved=await saveMailTemplate(language,{subject,html:safe},role);
    reply.header("Cache-Control","no-store");return {status:"SAVED",...saved};
  }catch(e){return reply.code(422).send({error:e.code||"MAIL_TEMPLATE_INVALID"})}
});
app.post("/api/v1/mailing/template/:language/reset",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  if(!["ADMIN_1","ADMIN_2"].includes(role))return reply.code(403).send({error:"ADMIN_ROLE_REQUIRED"});
  const saved=await resetMailTemplate(normLang(req.params?.language),role);
  reply.header("Cache-Control","no-store");return {status:"RESET",...saved};
});

app.get("/api/v1/contacts",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  reply.header("Cache-Control","no-store");
  return {rows:await listContacts()};
});

app.post("/api/v1/mailing/digest",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  if(!["ADMIN_1","ADMIN_2"].includes(role))return reply.code(403).send({error:"ADMIN_ROLE_REQUIRED"});
  let pdf=null,language="UA";
  for await(const part of req.parts()){
    if(part.type==="file"&&part.fieldname==="pdf")pdf=await part.toBuffer();
    else if(part.fieldname==="language")language=normLang(part.value);
  }
  if(!pdf||pdf.length<5||pdf.subarray(0,5).toString()!=="%PDF-")return reply.code(400).send({error:"VALID_PDF_REQUIRED"});
  const [currentMeta,currentPdf]=await Promise.all([getCurrentMeta(language),getCurrentPdf(language)]);
  if(!currentMeta||!currentPdf)return reply.code(409).send({error:"APPROVED_CURRENT_DIGEST_REQUIRED",language});
  const uploadedSha=sha256(pdf),currentSha=sha256(currentPdf);
  if(uploadedSha!==currentSha)return reply.code(409).send({error:"PDF_NOT_EQUAL_TO_ADMIN1_APPROVED_CURRENT",language,current_revision:currentMeta.revision});
  const rec=await saveValidatedDigest(language,{sha256:uploadedSha,revision:currentMeta.revision,issue:currentMeta.issue,approved_by:currentMeta.approved_by,uploaded_by:role,bytes:pdf.length});
  return {status:"READY_FOR_MAILING",...rec};
});

app.get("/api/v1/mailing/status",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  const [contacts,campaigns,ua,en]=await Promise.all([listContacts(),listCampaigns(),getValidatedDigest("UA"),getValidatedDigest("EN")]);
  return {
    smtp_configured:!!smtpTransport(),
    from_configured:!!mailingFrom(),
    unsubscribe_configured:!!unsubscribeSecret()&&!!publicBaseUrl(),
    active:contacts.filter(x=>x.status==="ACTIVE"&&x.marketing_consent===true&&!x.unsubscribed_at).length,
    suppressed:contacts.filter(x=>x.status==="SUPPRESSED"||x.unsubscribed_at).length,
    validated_digest:{UA:ua,EN:en},
    campaigns
  };
});

app.post("/api/v1/mailing/test",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  if(!["ADMIN_1","ADMIN_2"].includes(role))return reply.code(403).send({error:"ADMIN_ROLE_REQUIRED"});
  const transport=smtpTransport(),from=mailingFrom();
  if(!transport||!from)return reply.code(503).send({error:"SMTP_NOT_CONFIGURED"});
  if(!unsubscribeSecret()||!publicBaseUrl())return reply.code(503).send({error:"UNSUBSCRIBE_NOT_CONFIGURED"});
  const email=String(req.body?.email||"").trim().toLowerCase(),language=normLang(req.body?.language);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return reply.code(400).send({error:"VALID_TEST_EMAIL_REQUIRED"});
  const validated=await getValidatedDigest(language),pdf=await getCurrentPdf(language),meta=await getCurrentMeta(language);
  if(!validated||!pdf||!meta||validated.sha256!==sha256(pdf))return reply.code(409).send({error:"VALIDATED_DIGEST_REQUIRED",language});
  const fake={id:"TEST",email,name:"IIG Admin",language},unsubscribeUrl=publicBaseUrl()+"/unsubscribe-test",msg=await messageFor(fake,language,unsubscribeUrl);
  await transport.sendMail({from,to:email,subject:"[TEST] "+msg.subject,text:msg.text,html:msg.html,attachments:[{filename:language==="EN"?"IIG_Monthly_Digest_EN.pdf":"IIG_Monthly_Digest_UA.pdf",content:pdf,contentType:"application/pdf"}],headers:{"X-IIG-Test":"true","X-IIG-Digest-Revision":String(meta.revision||"")}});
  return {status:"TEST_SENT",to:email,language,revision:meta.revision};
});

app.post("/api/v1/mailing/send",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  if(role!=="ADMIN_1")return reply.code(403).send({error:"ADMIN_1_REQUIRED_TO_START_MAILING"});
  const transport=smtpTransport(),from=mailingFrom();
  if(!transport||!from)return reply.code(503).send({error:"SMTP_NOT_CONFIGURED"});
  if(!unsubscribeSecret()||!publicBaseUrl())return reply.code(503).send({error:"UNSUBSCRIBE_NOT_CONFIGURED"});
  const contacts=await mailingEligibleContacts();
  if(!contacts.length)return reply.code(409).send({error:"NO_ACTIVE_RECIPIENTS"});
  const needed=[...new Set(contacts.map(x=>normLang(x.language)))];
  for(const lang of needed){if(!await getValidatedDigest(lang))return reply.code(409).send({error:"VALIDATED_DIGEST_REQUIRED",language:lang})}
  const campaign=await beginCampaign({started_by:role,recipient_count:contacts.length});
  let sent=0,failed=0;const failures=[];
  for(const contact of contacts){
    const lang=normLang(contact.language),validated=await getValidatedDigest(lang),pdf=await getCurrentPdf(lang),meta=await getCurrentMeta(lang);
    if(!validated||!pdf||!meta||validated.sha256!==sha256(pdf)){failed++;failures.push({email:contact.email,error:"DIGEST_VALIDATION_CHANGED"});continue}
    const token=unsubscribeToken(contact),unsubscribeUrl=publicBaseUrl()+"/unsubscribe?token="+encodeURIComponent(token),msg=await messageFor(contact,lang,unsubscribeUrl);
    try{
      await transport.sendMail({
        from,
        to:contact.email,
        subject:msg.subject,
        text:msg.text,
        html:msg.html,
        attachments:[{filename:lang==="EN"?"IIG_Monthly_Digest_EN.pdf":"IIG_Monthly_Digest_UA.pdf",content:pdf,contentType:"application/pdf"}],
        headers:{
          "List-Unsubscribe":"<"+unsubscribeUrl+">",
          "X-IIG-Campaign":campaign.id,
          "X-IIG-Digest-Revision":String(meta.revision||"")
        }
      });
      sent++;
    }catch(e){failed++;failures.push({email:contact.email,error:String(e.message||e).slice(0,180)})}
  }
  const final=await completeCampaign(campaign.id,{status:failed?"COMPLETED_WITH_ERRORS":"COMPLETED",total:contacts.length,sent,failed,skipped:0,failures});
  return final;
});

app.get("/unsubscribe",async(req,reply)=>{
  const data=verifyUnsubscribeToken(req.query?.token);
  if(!data)return reply.code(400).type("text/html; charset=utf-8").send("<!doctype html><meta charset=utf-8><title>IIG</title><p>Посилання недійсне або застаріло.</p>");
  const contact=await getContactById(data.cid);
  if(!contact)return reply.code(404).type("text/html; charset=utf-8").send("<!doctype html><meta charset=utf-8><title>IIG</title><p>Контакт не знайдено.</p>");
  return reply.type("text/html; charset=utf-8").send(`<!doctype html><html lang="${normLang(contact.language)==="EN"?"en":"uk"}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>IIG Unsubscribe</title><body style="font-family:Arial;max-width:620px;margin:60px auto;padding:20px"><h1>IIG Monthly Digest</h1><p>${normLang(contact.language)==="EN"?"Please confirm that you want to unsubscribe ":"Підтвердьте, що бажаєте відписати "}<b>${escapeHtml(contact.email)}</b>.</p><form method="post" action="/unsubscribe"><input type="hidden" name="token" value="${escapeHtml(req.query.token)}"><button style="padding:12px 18px">${normLang(contact.language)==="EN"?"Confirm unsubscribe":"Підтвердити відписку"}</button></form></body></html>`);
});

app.post("/unsubscribe",async(req,reply)=>{
  const data=verifyUnsubscribeToken(req.body?.token);
  if(!data)return reply.code(400).type("text/html; charset=utf-8").send("<p>Invalid link.</p>");
  const contact=await markUnsubscribed(data.cid,{reason:"USER_REQUEST",source:"email_unsubscribe"});
  const en=normLang(contact.language)==="EN";
  return reply.type("text/html; charset=utf-8").send(`<!doctype html><html lang="${en?"en":"uk"}"><meta charset="utf-8"><title>IIG</title><body style="font-family:Arial;max-width:620px;margin:60px auto;padding:20px"><h1>IIG Monthly Digest</h1><p>${en?"You have been unsubscribed. No further marketing Digest emails will be sent to this address.":"Ви успішно відписалися. На цю адресу більше не надсилатиметься маркетинговий IIG Monthly Digest."}</p></body></html>`);
});


function validateEditorialRichHtml(item){
  const h=String(item?.body_html?.ua||"");
  if(!h)return true;
  if(/<\s*(script|style|iframe|object|embed|svg|math|form|input|button|a)\b/i.test(h))return false;
  if(/\son\w+\s*=|javascript:|data:text\/html/i.test(h))return false;
  return true;
}
app.post("/api/v1/editorial/drafts/:slug",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  if(!["ADMIN_1","ADMIN_2"].includes(role))return reply.code(403).send({error:"EDITOR_ROLE_REQUIRED"});
  const slug=safeSlug(req.params?.slug),item=req.body?.item;
  if(!slug||!item||typeof item!=="object")return reply.code(400).send({error:"INVALID_EDITORIAL_DRAFT"});if(!validateEditorialRichHtml(item))return reply.code(400).send({error:"UNSAFE_EDITORIAL_HTML"});
  const record={schema:"iig.editorial-draft.v1",slug,status:"REVIEW",edited_by:role,edited_at:new Date().toISOString(),item:{...item,slug,status:"REVIEW",admin_approved:false,demo_published:false,editorial_edited_by:role}};
  await saveEditorialDraft(slug,record);reply.header("Cache-Control","no-store");return {status:"SAVED",slug,edited_by:role,edited_at:record.edited_at};
});

app.post("/api/v1/editorial/refresh",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  if(role!=="ADMIN_1")return reply.code(403).send({error:"ADMIN_1_REQUIRED"});
  if(!ghToken())return reply.code(503).send({error:"EDITORIAL_BACKEND_NOT_CONFIGURED",detail:"IIG_GITHUB_ACTIONS_TOKEN is required"});
  const requestId="edr-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8),requestedAt=new Date().toISOString();
  const reason=String((req.body&&req.body.reason)||"admin-ui-refresh").slice(0,120);
  await githubApi("/repos/"+ghRepo+"/actions/workflows/"+encodeURIComponent(ghWorkflow)+"/dispatches",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ref:ghBranch,inputs:{reason:requestId+":"+reason}})});
  EDITORIAL_REFRESH_REQUESTS.set(requestId,{requestId,requestedAt,role,status:"QUEUED"});
  reply.header("Cache-Control","no-store");
  return reply.code(202).send({request_id:requestId,status:"QUEUED",requested_at:requestedAt});
});
app.get("/api/v1/editorial/refresh/:id",async(req,reply)=>{
  const role=requireAdmin(req,reply);if(!role)return;
  const id=String((req.params&&req.params.id)||""),rec=EDITORIAL_REFRESH_REQUESTS.get(id);
  if(!rec)return reply.code(404).send({error:"EDITORIAL_REFRESH_REQUEST_NOT_FOUND"});
  try{
    const q="/repos/"+ghRepo+"/actions/workflows/"+encodeURIComponent(ghWorkflow)+"/runs?event=workflow_dispatch&branch="+encodeURIComponent(ghBranch)+"&per_page=10";
    const out=await githubApi(q),runs=((out.body&&out.body.workflow_runs)||[]).filter(x=>Date.parse(x.created_at)>=Date.parse(rec.requestedAt)-30000).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
    const run=runs[0];if(!run)return {request_id:id,status:"QUEUED",requested_at:rec.requestedAt};
    const status=run.status==="completed"?(run.conclusion==="success"?"COMPLETE":"FAILED"):"RUNNING";
    rec.status=status;rec.run_id=run.id;rec.conclusion=run.conclusion||null;
    return {request_id:id,status,run_id:run.id,conclusion:run.conclusion||null,created_at:run.created_at,updated_at:run.updated_at};
  }catch(e){return reply.code(502).send({error:"EDITORIAL_STATUS_FAILED",detail:String(e.message||e)})}
});

app.get("/api/v1/digest/current",async(req,reply)=>{
  const language=normLang(req.query?.language),meta=await getCurrentMeta(language);
  reply.header("Cache-Control","no-store");
  if(!meta)return reply.code(404).send({status:"NO_CURRENT",language});
  return meta;
});

function sendCurrentPdfFor(language){
  return async(req,reply)=>{
    const [meta,pdf]=await Promise.all([getCurrentMeta(language),getCurrentPdf(language)]);
    if(!meta||!pdf)return reply.code(404).send({error:"NO_CURRENT",language});
    const suffix=language==="EN"?"_EN":"";
    reply.header("Content-Type","application/pdf");
    reply.header("Content-Disposition",`attachment; filename="IIG_Digest_${String(meta.issue||"CURRENT").slice(5,7)}_${String(meta.issue||"CURRENT").slice(0,4)}${suffix}.pdf"`);
    reply.header("ETag",`"${meta.sha256||meta.revision}"`);
    reply.header("Cache-Control","public,max-age=0,must-revalidate");
    return reply.send(pdf);
  };
}
app.get("/digest/current.pdf",sendCurrentPdfFor("UA"));
app.get("/digest/current-en.pdf",sendCurrentPdfFor("EN"));

const port=Number(process.env.PORT||8787),host=process.env.HOST||"0.0.0.0";
await app.listen({port,host});
