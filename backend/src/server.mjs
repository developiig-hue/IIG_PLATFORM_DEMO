import Fastify from "fastify";
import multipart from "@fastify/multipart";
import {requireAdmin} from "./auth.mjs";
import {putCurrent,getCurrentMeta,getCurrentPdf,revisionFor,sha256} from "./storage.mjs";
import {saveApproval,getApproval} from "./approval-store.mjs";
import {verifyPdfLinks} from "./pdf-links.mjs";

const app=Fastify({logger:true,bodyLimit:30*1024*1024});
await app.register(multipart,{limits:{fileSize:25*1024*1024,files:1,fields:8}});

const allowedOrigins=new Set(String(process.env.IIG_ALLOWED_ORIGINS||"").split(",").map(x=>x.trim()).filter(Boolean));
app.addHook("onRequest",async(req,reply)=>{
  const origin=req.headers.origin;
  if(origin && allowedOrigins.size && !allowedOrigins.has(origin)) return reply.code(403).send({error:"ORIGIN_NOT_ALLOWED"});
  if(origin && allowedOrigins.has(origin)){
    reply.header("Access-Control-Allow-Origin",origin);
    reply.header("Vary","Origin");
    reply.header("Access-Control-Allow-Credentials","true");
  }
  if(req.method==="OPTIONS"){
    reply.header("Access-Control-Allow-Methods","GET,HEAD,POST,OPTIONS");
    reply.header("Access-Control-Allow-Headers","Authorization,Content-Type,X-IIG-Admin-Role,X-IIG-Admin-Action,X-IIG-Digest-Revision");
    return reply.code(204).send();
  }
});

app.get("/healthz",async()=>({ok:true,service:"iig-digest-publication-service"}));

app.post("/api/v1/digest/approvals",async(req,reply)=>{
  const role=requireAdmin(req,reply); if(!role)return;
  if(role!=="ADMIN_1") return reply.code(403).send({error:"ADMIN_1_REQUIRED"});
  const body=req.body||{};
  const issue=String(body.issue||""),fingerprint=String(body.fingerprint||"");
  if(!/^\d{4}-\d{2}$/.test(issue)||fingerprint.length<8) return reply.code(400).send({error:"INVALID_APPROVAL"});
  const record={
    schema:"iig.digest-server-approval.v1",
    issue,fingerprint,
    preview_fingerprint:String(body.preview_fingerprint||fingerprint),
    approved_by:"ADMIN_1",
    approved_at:new Date().toISOString(),
    revision:Number(body.revision||0)
  };
  await saveApproval(record);
  return {status:"APPROVED",...record};
});

app.post("/api/v1/digest/releases",async(req,reply)=>{
  const role=requireAdmin(req,reply); if(!role)return;
  let pdf=null,meta=null;
  for await (const part of req.parts()){
    if(part.type==="file"){
      if(part.fieldname==="pdf") pdf=await part.toBuffer();
      else if(part.fieldname==="metadata"){
        try{meta=JSON.parse((await part.toBuffer()).toString("utf8"))}catch{}
      }
    }else if(part.fieldname==="metadata"){
      try{meta=JSON.parse(part.value)}catch{}
    }
  }
  meta=meta||{};
  const issue=String(meta.issue||req.headers["x-iig-digest-issue"]||"");
  const fingerprint=String(meta.fingerprint||req.headers["x-iig-digest-fingerprint"]||"");
  if(!pdf||pdf.length<5||pdf.subarray(0,5).toString()!=="%PDF-") return reply.code(400).send({error:"VALID_PDF_REQUIRED"});
  if(!/^\d{4}-\d{2}$/.test(issue)||fingerprint.length<8) return reply.code(400).send({error:"ISSUE_AND_FINGERPRINT_REQUIRED"});

  const approval=await getApproval();
  if(!approval||approval.issue!==issue||approval.fingerprint!==fingerprint||approval.approved_by!=="ADMIN_1"){
    return reply.code(409).send({error:"ADMIN1_APPROVAL_RECEIPT_MISMATCH"});
  }

  const expectedLinks=Array.isArray(meta.iig_links)?meta.iig_links:[];
  const linkCheck=await verifyPdfLinks(pdf,expectedLinks);
  if(!linkCheck.links_preserved) return reply.code(422).send({
    error:"PDF_LINK_VERIFICATION_FAILED",
    link_count:linkCheck.link_count,
    missing_links:linkCheck.missing_links
  });

  const revision=revisionFor(pdf),hash=sha256(pdf);
  const publicBase=String(process.env.PUBLIC_BASE_URL||"").replace(/\/$/,"");
  const publicUrl=(publicBase?publicBase:"")+"/digest/current.pdf";
  const record={
    schema:"iig.digest-current.v1",
    status:"CURRENT",
    issue,
    fingerprint,
    approved_by:"ADMIN_1",
    approved_at:approval.approved_at,
    uploaded_by:role,
    published_at:new Date().toISOString(),
    revision,
    sha256:hash,
    bytes:pdf.length,
    public_url:publicUrl,
    links_preserved:true,
    link_count:linkCheck.link_count,
    previous_current_deleted:true
  };

  await putCurrent(pdf,record);
  reply.header("Cache-Control","no-store");
  return record;
});

app.get("/api/v1/digest/current",async(req,reply)=>{
  const meta=await getCurrentMeta();
  reply.header("Cache-Control","no-store");
  if(!meta) return reply.code(404).send({status:"NO_CURRENT"});
  return meta;
});

async function sendCurrentPdf(req,reply){
  const [meta,pdf]=await Promise.all([getCurrentMeta(),getCurrentPdf()]);
  if(!meta||!pdf) return reply.code(404).send({error:"NO_CURRENT"});
  reply.header("Content-Type","application/pdf");
  reply.header("Content-Disposition",`attachment; filename="IIG_Digest_${String(meta.issue||"CURRENT").slice(5,7)}_${String(meta.issue||"CURRENT").slice(0,4)}.pdf"`);
  reply.header("ETag",`"${meta.sha256||meta.revision}"`);
  reply.header("Cache-Control","public,max-age=0,must-revalidate");
  return reply.send(pdf);
}
app.get("/digest/current.pdf",sendCurrentPdf);

const port=Number(process.env.PORT||8787),host=process.env.HOST||"0.0.0.0";
await app.listen({port,host});
