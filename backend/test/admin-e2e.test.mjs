import test from "node:test";
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {totpCode} from "../src/session-auth.mjs";

const PORT=8899, BASE="http://127.0.0.1:"+PORT, SECRET="JBSWY3DPEHPK3PXP";
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function waitHealth(){for(let i=0;i<80;i++){try{const r=await fetch(BASE+"/healthz");if(r.ok)return}catch{}await wait(100)}throw new Error("backend did not start")}
function cookieFrom(r){return (r.headers.get("set-cookie")||"").split(";")[0]}
async function login(username,password){
  let r=await fetch(BASE+"/api/v1/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});
  assert.equal(r.status,200);const a=await r.json();
  r=await fetch(BASE+"/api/v1/auth/mfa",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({challenge_id:a.challenge_id,code:totpCode(SECRET)})});
  assert.equal(r.status,200);const b=await r.json();return {cookie:cookieFrom(r),csrf:b.csrf,role:b.role};
}
async function api(session,url,opts={}){
  const headers=new Headers(opts.headers||{});headers.set("Cookie",session.cookie);
  const method=String(opts.method||"GET").toUpperCase();if(["POST","PUT","PATCH","DELETE"].includes(method))headers.set("X-IIG-CSRF",session.csrf);
  const r=await fetch(BASE+url,{...opts,headers}),ct=r.headers.get("content-type")||"";
  const body=ct.includes("application/json")?await r.json():await r.text();
  if(!r.ok)throw new Error(url+" -> "+r.status+" "+JSON.stringify(body));return {r,body};
}

test("secure Admin -> NEWS -> approval -> Digest -> test mailing -> RADAR -> contacts",async(t)=>{
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),"iig-e2e-"));
  const child=spawn(process.execPath,["src/server.mjs"],{cwd:path.resolve("."),env:{...process.env,
    NODE_ENV:"test",PORT:String(PORT),HOST:"127.0.0.1",IIG_E2E_MODE:"true",IIG_COOKIE_SECURE:"false",
    PUBLIC_BASE_URL:BASE,IIG_ALLOWED_ORIGINS:BASE,
    IIG_ADMIN1_USERNAME:"admin1",IIG_ADMIN2_USERNAME:"admin2",
    IIG_ADMIN1_PASSWORD:"test-a1",IIG_ADMIN2_PASSWORD:"test-a2",
    IIG_ADMIN1_MFA_SECRET:SECRET,IIG_ADMIN2_MFA_SECRET:SECRET,
    IIG_AUTH_DIR:path.join(tmp,"auth"),IIG_AUDIT_DIR:path.join(tmp,"audit"),IIG_EDITORIAL_DRAFT_DIR:path.join(tmp,"editorial"),
    IIG_REQUESTS_DIR:path.join(tmp,"requests"),IIG_MAILING_DIR:path.join(tmp,"mailing"),IIG_DIGEST_LOCAL_DIR:path.join(tmp,"digest"),
    IIG_UNSUBSCRIBE_SECRET:"e2e-only",IIG_MAIL_FROM:"e2e@example.test"
  },stdio:["ignore","pipe","pipe"]});
  t.after(async()=>{child.kill("SIGTERM");await fs.rm(tmp,{recursive:true,force:true})});await waitHealth();

  const admin1=await login("admin1","test-a1");assert.equal(admin1.role,"ADMIN_1");
  let x=await api(admin1,"/api/v1/auth/session");assert.equal(x.body.authenticated,true);

  const slug="e2e-news",news={slug,content_type:"NEWS",status:"REVIEW",admin_approved:false,image_admin_approved:true,title:{ua:"E2E NEWS"},summary:{ua:"E2E summary"},body:{ua:"E2E body"},canonical_url:"https://example.test/source"};
  x=await api(admin1,"/api/v1/editorial/drafts/"+slug,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({item:news})});assert.equal(x.body.status,"SAVED");
  x=await api(admin1,"/api/v1/editorial/"+slug+"/approve",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});assert.equal(x.body.status,"APPROVED");
  x=await api(admin1,"/api/v1/editorial/"+slug+"/publish",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});assert.equal(x.body.status,"PUBLISHED");

  const issue="2026-10",fingerprint="e2e-fingerprint-1234567890";
  x=await api(admin1,"/api/v1/digest/approvals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({issue,language:"UA",fingerprint,preview_fingerprint:fingerprint,revision:1})});assert.equal(x.body.status,"APPROVED");

  const pdf=Buffer.from("%PDF-1.4\n% IIG E2E\n%%EOF\n");
  const releaseForm=new FormData();releaseForm.append("pdf",new Blob([pdf],{type:"application/pdf"}),"IIG_E2E.pdf");releaseForm.append("metadata",JSON.stringify({issue,language:"UA",fingerprint,iig_links:[]}));
  x=await api(admin1,"/api/v1/digest/releases",{method:"POST",body:releaseForm});assert.equal(x.body.status,"CURRENT");

  const mailingForm=new FormData();mailingForm.append("pdf",new Blob([pdf],{type:"application/pdf"}),"IIG_E2E.pdf");mailingForm.append("language","UA");
  x=await api(admin1,"/api/v1/mailing/digest",{method:"POST",body:mailingForm});assert.equal(x.body.status,"READY_FOR_MAILING");
  x=await api(admin1,"/api/v1/mailing/test",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"admin@example.test",language:"UA"})});assert.equal(x.body.status,"TEST_SENT_SIMULATED");

  x=await api(admin1,"/api/v1/radar/runs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:"industrial CHP"})});assert.equal(x.body.state,"success");
  x=await api(admin1,"/api/v1/radar/runs/"+encodeURIComponent(x.body.id));assert.equal(x.body.count,1);

  const publicReq=await fetch(BASE+"/api/v1/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"subscribe",name:"E2E User",company:"E2E Co",email:"e2e.user@example.test",language:"UA",consent:true,consent_text:"E2E consent",website:""})});
  assert.equal(publicReq.status,201);const reqBody=await publicReq.json();

  const admin2=await login("admin2","test-a2");assert.equal(admin2.role,"ADMIN_2");
  x=await api(admin2,"/api/v1/requests/export/subscribe.xls");assert.match(String(x.body),/Workbook/);
  x=await api(admin2,"/api/v1/requests/"+encodeURIComponent(reqBody.id)+"/processed",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({processed:true})});assert.equal(x.body.status,"PROCESSED");
  x=await api(admin2,"/api/v1/requests/"+encodeURIComponent(reqBody.id)+"/promote-contact",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});assert.equal(x.body.contact.status,"ACTIVE");
  x=await api(admin2,"/api/v1/contacts");assert.ok(x.body.rows.some(r=>r.email==="e2e.user@example.test"));

  const auditRows=await api(admin1,"/api/v1/audit?limit=50");assert.ok(auditRows.body.rows.some(r=>r.action==="DIGEST_RELEASE"));assert.ok(auditRows.body.rows.some(r=>r.action==="EDITORIAL_APPROVE"));
});
