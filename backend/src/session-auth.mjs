import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const dir=path.resolve(process.env.IIG_AUTH_DIR||"./var/auth");
const sessionFile=path.join(dir,"sessions.json");
const challengeFile=path.join(dir,"challenges.json");
const SESSION_COOKIE="iig_admin_session";
const SESSION_TTL_MS=Number(process.env.IIG_SESSION_TTL_MINUTES||30)*60*1000;
const ABS_TTL_MS=Number(process.env.IIG_SESSION_ABSOLUTE_HOURS||12)*60*60*1000;
const CHALLENGE_TTL_MS=5*60*1000;
const loginRate=new Map();
let mutation=Promise.resolve();

function clean(v){return String(v??"").replace(/[\u0000-\u001F\u007F]/g,"").trim()}
function now(){return Date.now()}
function b64url(buf){return Buffer.from(buf).toString("base64url")}
function randomToken(bytes=32){return b64url(crypto.randomBytes(bytes))}
function hashToken(token){return crypto.createHash("sha256").update(String(token||"")).digest("hex")}
function safeEqual(a="",b=""){const A=Buffer.from(String(a)),B=Buffer.from(String(b));return A.length===B.length&&crypto.timingSafeEqual(A,B)}

async function readJson(file,fallback){
  try{return JSON.parse(await fs.readFile(file,"utf8"))}catch(e){if(e.code==="ENOENT")return structuredClone(fallback);throw e}
}
async function writeJson(file,data){
  await fs.mkdir(dir,{recursive:true});
  const tmp=file+"."+process.pid+"."+Date.now()+".tmp";
  await fs.writeFile(tmp,JSON.stringify(data,null,2)+"\n",{mode:0o600});
  await fs.rename(tmp,file);
}
async function mutate(file,fallback,fn){
  let resolveOuter,rejectOuter;
  const outer=new Promise((res,rej)=>{resolveOuter=res;rejectOuter=rej});
  mutation=mutation.then(async()=>{try{const db=await readJson(file,fallback),result=await fn(db);await writeJson(file,db);resolveOuter(result)}catch(e){rejectOuter(e)}}).catch(()=>{});
  return outer;
}

function roleForUsername(username){
  const u=clean(username).toLowerCase();
  const a1=clean(process.env.IIG_ADMIN1_USERNAME||"admin1").toLowerCase();
  const a2=clean(process.env.IIG_ADMIN2_USERNAME||"admin2").toLowerCase();
  if(u&&u===a1)return "ADMIN_1";
  if(u&&u===a2)return "ADMIN_2";
  return null;
}
function passwordHashFor(role){return clean(role==="ADMIN_1"?process.env.IIG_ADMIN1_PASSWORD_HASH:process.env.IIG_ADMIN2_PASSWORD_HASH)}
function devPasswordFor(role){
  if(String(process.env.NODE_ENV||"").toLowerCase()==="production")return "";
  return String(role==="ADMIN_1"?process.env.IIG_ADMIN1_PASSWORD:process.env.IIG_ADMIN2_PASSWORD);
}
export function scryptHash(password,{N=16384,r=8,p=1,salt=crypto.randomBytes(16)}={}){
  const key=crypto.scryptSync(String(password),salt,32,{N,r,p,maxmem:64*1024*1024});
  return ["scrypt",N,r,p,b64url(salt),b64url(key)].join("$");
}
function verifyPassword(password,stored){
  if(!stored)return false;
  const parts=stored.split("$");
  if(parts.length!==6||parts[0]!=="scrypt")return false;
  const [,Ns,rs,ps,salt64,key64]=parts,N=Number(Ns),r=Number(rs),p=Number(ps);
  if(!Number.isFinite(N)||!Number.isFinite(r)||!Number.isFinite(p))return false;
  try{
    const salt=Buffer.from(salt64,"base64url"),expected=Buffer.from(key64,"base64url");
    const got=crypto.scryptSync(String(password),salt,expected.length,{N,r,p,maxmem:64*1024*1024});
    return expected.length===got.length&&crypto.timingSafeEqual(expected,got);
  }catch{return false}
}
function mfaSecretFor(role){return clean(role==="ADMIN_1"?process.env.IIG_ADMIN1_MFA_SECRET:process.env.IIG_ADMIN2_MFA_SECRET).replace(/\s+/g,"").toUpperCase()}
const B32="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Decode(v){
  let bits="",out=[];
  for(const ch of String(v||"").replace(/=+$/,"").toUpperCase()){
    const i=B32.indexOf(ch);if(i<0)continue;bits+=i.toString(2).padStart(5,"0");
  }
  for(let i=0;i+8<=bits.length;i+=8)out.push(parseInt(bits.slice(i,i+8),2));
  return Buffer.from(out);
}
export function totpCode(secret,time=Date.now(),step=30,digits=6){
  const key=base32Decode(secret);if(!key.length)return "";
  const ctr=Math.floor(time/1000/step),buf=Buffer.alloc(8);buf.writeBigUInt64BE(BigInt(ctr));
  const h=crypto.createHmac("sha1",key).update(buf).digest(),off=h[h.length-1]&15;
  const n=(h.readUInt32BE(off)&0x7fffffff)%10**digits;
  return String(n).padStart(digits,"0");
}
function verifyTotp(secret,code){
  const c=clean(code).replace(/\s+/g,"");if(!/^\d{6}$/.test(c)||!secret)return false;
  for(const delta of [-30000,0,30000])if(safeEqual(totpCode(secret,Date.now()+delta),c))return true;
  return false;
}
function rateKey(req,username){return String(req.headers["x-forwarded-for"]||req.ip||"").split(",")[0].trim()+"|"+clean(username).toLowerCase()}
function consumeLoginRate(req,username){
  const k=rateKey(req,username),t=now(),windowMs=15*60*1000,limit=8;
  const arr=(loginRate.get(k)||[]).filter(x=>t-x<windowMs);arr.push(t);loginRate.set(k,arr);return arr.length<=limit;
}
export async function startLogin(req,username,password){
  if(!consumeLoginRate(req,username))throw Object.assign(new Error("LOGIN_RATE_LIMIT"),{statusCode:429});
  const role=roleForUsername(username);if(!role)throw Object.assign(new Error("INVALID_CREDENTIALS"),{statusCode:401});
  const hash=passwordHashFor(role),dev=devPasswordFor(role);
  const ok=hash?verifyPassword(password,hash):(dev?safeEqual(password,dev):false);
  if(!ok)throw Object.assign(new Error("INVALID_CREDENTIALS"),{statusCode:401});
  const secret=mfaSecretFor(role);
  if(!secret)throw Object.assign(new Error("MFA_NOT_CONFIGURED"),{statusCode:503});
  const id=randomToken(24),rec={id,role,username:clean(username),created_at:now(),expires_at:now()+CHALLENGE_TTL_MS,attempts:0};
  await mutate(challengeFile,{challenges:[]},db=>{db.challenges=(db.challenges||[]).filter(x=>x.expires_at>now());db.challenges.push(rec);return true});
  return {challenge_id:id,mfa_required:true,expires_in_seconds:Math.floor(CHALLENGE_TTL_MS/1000),role_hint:role};
}
export async function finishMfa(challengeId,code,meta={}){
  let verified=null;
  await mutate(challengeFile,{challenges:[]},db=>{
    db.challenges=(db.challenges||[]).filter(x=>x.expires_at>now());
    const rec=db.challenges.find(x=>safeEqual(x.id,challengeId));
    if(!rec)throw Object.assign(new Error("MFA_CHALLENGE_INVALID"),{statusCode:401});
    rec.attempts=Number(rec.attempts||0)+1;
    if(rec.attempts>6)throw Object.assign(new Error("MFA_CHALLENGE_LOCKED"),{statusCode:429});
    if(!verifyTotp(mfaSecretFor(rec.role),code))throw Object.assign(new Error("MFA_CODE_INVALID"),{statusCode:401});
    verified={...rec};db.challenges=db.challenges.filter(x=>x.id!==rec.id);return true;
  });
  const raw=randomToken(32),csrf=randomToken(24),t=now();
  const session={id_hash:hashToken(raw),role:verified.role,username:verified.username,csrf_hash:hashToken(csrf),created_at:t,last_seen_at:t,expires_at:t+SESSION_TTL_MS,absolute_expires_at:t+ABS_TTL_MS,ip_hash:clean(meta.ip_hash),user_agent:clean(meta.user_agent).slice(0,300)};
  await mutate(sessionFile,{sessions:[]},db=>{db.sessions=(db.sessions||[]).filter(x=>x.expires_at>t&&x.absolute_expires_at>t);db.sessions.push(session);return true});
  return {token:raw,csrf,role:session.role,username:session.username,expires_at:session.expires_at};
}
function parseCookie(req){
  const raw=String(req.headers.cookie||"");
  const out={};for(const part of raw.split(";")){const i=part.indexOf("=");if(i>0)out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim())}
  return out;
}
export async function resolveSession(req){
  const token=parseCookie(req)[SESSION_COOKIE];if(!token)return null;
  const h=hashToken(token),t=now(),db=await readJson(sessionFile,{sessions:[]});
  const s=(db.sessions||[]).find(x=>safeEqual(x.id_hash,h));
  if(!s||s.expires_at<=t||s.absolute_expires_at<=t)return null;
  if(t-Number(s.last_seen_at||0)>60000){
    await mutate(sessionFile,{sessions:[]},d=>{const x=(d.sessions||[]).find(v=>safeEqual(v.id_hash,h));if(x){x.last_seen_at=t;x.expires_at=Math.min(t+SESSION_TTL_MS,x.absolute_expires_at)}return true});
    s.last_seen_at=t;s.expires_at=Math.min(t+SESSION_TTL_MS,s.absolute_expires_at);
  }
  return {...s,token_hash:h};
}
export async function logout(req){
  const token=parseCookie(req)[SESSION_COOKIE];if(!token)return;
  const h=hashToken(token);await mutate(sessionFile,{sessions:[]},db=>{db.sessions=(db.sessions||[]).filter(x=>!safeEqual(x.id_hash,h));return true});
}
export function validateCsrf(req,session){
  if(!session)return false;
  const token=clean(req.headers["x-iig-csrf"]||"");
  return !!token&&safeEqual(hashToken(token),session.csrf_hash);
}
export function sessionCookie(token){
  const secure=String(process.env.NODE_ENV||"").toLowerCase()==="production"||String(process.env.IIG_COOKIE_SECURE||"true").toLowerCase()==="true";
  return SESSION_COOKIE+"="+encodeURIComponent(token)+"; Path=/; HttpOnly; SameSite=Strict; Max-Age="+Math.floor(SESSION_TTL_MS/1000)+(secure?"; Secure":"");
}
export function clearSessionCookie(){
  const secure=String(process.env.NODE_ENV||"").toLowerCase()==="production"||String(process.env.IIG_COOKIE_SECURE||"true").toLowerCase()==="true";
  return SESSION_COOKIE+"=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"+(secure?"; Secure":"");
}
export function adminDisplayName(role){
  return role==="ADMIN_1"?(process.env.IIG_ADMIN1_DISPLAY_NAME||"ADMIN_1"):(process.env.IIG_ADMIN2_DISPLAY_NAME||"ADMIN_2");
}
