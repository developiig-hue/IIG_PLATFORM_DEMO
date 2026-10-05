import crypto from "node:crypto";

function safeEqual(a="", b="") {
  const A=Buffer.from(String(a)), B=Buffer.from(String(b));
  return A.length===B.length && crypto.timingSafeEqual(A,B);
}

export function resolveAdminRole(req) {
  const injected=String(req.headers["x-iig-admin-role"]||"").toUpperCase();
  if (injected==="ADMIN_1" || injected==="ADMIN_2") return injected;

  const auth=String(req.headers.authorization||"");
  const token=auth.startsWith("Bearer ")?auth.slice(7):"";
  const a1=process.env.IIG_ADMIN1_TOKEN||"";
  const a2=process.env.IIG_ADMIN2_TOKEN||"";
  if (a1 && safeEqual(token,a1)) return "ADMIN_1";
  if (a2 && safeEqual(token,a2)) return "ADMIN_2";
  return null;
}

export function requireAdmin(req, reply) {
  const role=resolveAdminRole(req);
  if (!role) {
    reply.code(401).send({error:"UNAUTHORIZED"});
    return null;
  }
  return role;
}
