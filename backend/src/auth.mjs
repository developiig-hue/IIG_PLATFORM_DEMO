import crypto from "node:crypto";
import {validateCsrf} from "./session-auth.mjs";

function safeEqual(a="", b="") {
  const A=Buffer.from(String(a)), B=Buffer.from(String(b));
  return A.length===B.length && crypto.timingSafeEqual(A,B);
}

function legacyRole(req){
  if(String(process.env.IIG_ALLOW_LEGACY_ADMIN_TOKENS||"false").toLowerCase()!=="true")return null;
  const auth=String(req.headers.authorization||"");
  const token=auth.startsWith("Bearer ")?auth.slice(7):"";
  const a1=process.env.IIG_ADMIN1_TOKEN||"";
  const a2=process.env.IIG_ADMIN2_TOKEN||"";
  if (a1 && safeEqual(token,a1)) return "ADMIN_1";
  if (a2 && safeEqual(token,a2)) return "ADMIN_2";
  return null;
}

function trustedProxyRole(req){
  const production=String(process.env.NODE_ENV||"").toLowerCase()==="production";
  if(production&&String(process.env.IIG_ALLOW_TRUSTED_PROXY_AUTH||"false").toLowerCase()!=="true")return null;
  const secret=String(process.env.IIG_TRUSTED_PROXY_SECRET||"");
  if(!secret)return null;
  const supplied=String(req.headers["x-iig-proxy-secret"]||"");
  if(!safeEqual(secret,supplied))return null;
  const role=String(req.headers["x-iig-admin-role"]||"").toUpperCase();
  return ["ADMIN_1","ADMIN_2"].includes(role)?role:null;
}

export function resolveAdminRole(req) {
  if(req.iigAdminSession?.role)return req.iigAdminSession.role;
  return trustedProxyRole(req)||legacyRole(req);
}

export function requireAdmin(req, reply) {
  const role=resolveAdminRole(req);
  if (!role) {
    reply.code(401).send({error:"UNAUTHORIZED"});
    return null;
  }
  if(req.iigAdminSession && ["POST","PUT","PATCH","DELETE"].includes(req.method)){
    if(!validateCsrf(req,req.iigAdminSession)){
      reply.code(403).send({error:"CSRF_REQUIRED"});
      return null;
    }
  }
  return role;
}

export function requireRole(req,reply,allowed=[]){
  const role=requireAdmin(req,reply);if(!role)return null;
  if(!allowed.includes(role)){reply.code(403).send({error:"RBAC_FORBIDDEN",role,allowed});return null}
  return role;
}
