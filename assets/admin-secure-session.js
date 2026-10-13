(()=>{"use strict";
if(location.hostname.endsWith("github.io"))return;
const boot=window.IIG_SECURE_BOOTSTRAP||{};
let csrf=String(boot.csrf||""),session=boot;
const nativeFetch=window.fetch.bind(window);
window.IIGSecureSession={get session(){return session},get role(){return session?.role||null},get csrf(){return csrf},ready:Promise.resolve(session)};
window.fetch=async function(input,init={}){
  const url=typeof input==="string"?input:(input&&input.url)||"";
  const same=!/^https?:\/\//i.test(url)||url.startsWith(location.origin);
  const method=String(init.method||((input&&input.method)||"GET")).toUpperCase();
  const opts={...init,credentials:same?"same-origin":init.credentials};
  if(same&&url.includes("/api/v1/")&&["POST","PUT","PATCH","DELETE"].includes(method)){
    const headers=new Headers(init.headers||((input&&input.headers)||{}));
    if(csrf&&!headers.has("X-IIG-CSRF"))headers.set("X-IIG-CSRF",csrf);
    opts.headers=headers;
  }
  const r=await nativeFetch(input,opts);
  if(same&&url.includes("/api/v1/")&&r.status===401&&!url.includes("/auth/")){
    location.replace("/admin/");throw new Error("ADMIN_SESSION_EXPIRED");
  }
  return r;
};
async function refreshSession(){
  const r=await nativeFetch("/api/v1/auth/session",{credentials:"same-origin",cache:"no-store"});
  if(!r.ok){location.replace("/admin/");return null}
  session=await r.json();csrf=String(session.csrf||csrf||"");window.IIG_SECURE_BOOTSTRAP=session;return session;
}
window.IIGSecureSession.ready=refreshSession().catch(()=>null);
function applyRole(){
  const role=String((window.IIG_SECURE_BOOTSTRAP||session||{}).role||"");
  const name=String((window.IIG_SECURE_BOOTSTRAP||session||{}).display_name||role);
  const badge=document.getElementById("activeAdminBadge");
  if(badge)badge.textContent=role+" · "+name;
  for(const id of ["newsEditorRole","digestOperatorRole","marketAdminRole"]){
    const el=document.getElementById(id);if(!el)continue;
    if([...el.options].some(o=>o.value===role)){el.value=role;el.dispatchEvent(new Event("change",{bubbles:true}))}
    el.disabled=true;el.title="Роль визначається захищеною server-side сесією";
  }
  document.querySelectorAll("[data-locked]").forEach(el=>{if(el.textContent?.match(/production/i))el.dataset.locked="Production privilege requires server-side RBAC"});
}
document.addEventListener("DOMContentLoaded",()=>{window.IIGSecureSession.ready.then(applyRole)});
window.IIGAdminLogout=async()=>{try{await window.fetch("/api/v1/auth/logout",{method:"POST"})}finally{location.replace("/admin/")}};
})();