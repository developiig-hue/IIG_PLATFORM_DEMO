import Fastify from "fastify";
import multipart from "@fastify/multipart";
import {requireAdmin} from "./auth.mjs";
import {putCurrent,getCurrentMeta,getCurrentPdf,revisionFor,sha256} from "./storage.mjs";
import {saveApproval,getApproval} from "./approval-store.mjs";
import {verifyPdfLinks} from "./pdf-links.mjs";
import {createRequest,listRequests,markDownloaded,markProcessed,promoteContact,lifetimeStats} from "./request-store.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const app=Fastify({logger:true,bodyLimit:30*1024*1024});
await app.register(multipart,{limits:{fileSize:25*1024*1024,files:1,fields:8}});
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
