(()=>{"use strict";
const DEMO_KEY="iig.demo.requests.v31";
const OWNER_VERIFIED_SUBSCRIBE_E2E_V32=true;
const $=s=>document.querySelector(s);
const clean=v=>String(v??"").trim();
function demoSave(item){
  const rows=JSON.parse(localStorage.getItem(DEMO_KEY)||"[]");
  rows.push(item);localStorage.setItem(DEMO_KEY,JSON.stringify(rows));
}
function demoId(type){const p={project:"PRJ",subscribe:"SUB",engineer:"ENG"}[type]||"REQ";return p+"-DEMO-"+Date.now().toString(36).toUpperCase()}
function formPayload(f){
  const type=f.id,data=Object.fromEntries(new FormData(f).entries());
  return {type,name:clean(data.name),company:clean(data.company),email:clean(data.email),phone:clean(data.phone),position:clean(data.position),industry:clean(data.industry),solution:clean(data.solution),message:clean(data.message),language:clean(data.language)||"UA",consent:data.consent==="yes",consent_text:clean(f.querySelector(".consent")?.innerText),website:clean(data.website)};
}
async function submit(f){
  const status=f.querySelector(".form-status"),button=f.querySelector('[type="submit"]');
  const body=formPayload(f);button.disabled=true;status.textContent="Надсилання…";
  try{
    const r=await fetch("/api/v1/requests",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify(body)});
    const x=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(x.error||("HTTP "+r.status));
    status.textContent="✓ Заявку отримано IIG. Номер: "+x.id+". Дата: "+new Date(x.received_at).toLocaleString("uk-UA");
    f.reset();return;
  }catch(e){
    if(location.hostname.endsWith("github.io")){
      const now=new Date().toISOString(),item={...body,id:demoId(body.type),received_at:now,status:"NEW",downloaded_at:null,downloaded_by:null,processed_at:null,processed_by:null,promoted_at:null,promoted_by:null,demo_only:true};
      demoSave(item);
      status.textContent="";
      f.reset();return;
    }
    status.textContent="Не вдалося передати звернення. Спробуйте ще раз або зв’яжіться з IIG.";
    console.error("[IIG requests]",e);
  }finally{button.disabled=false}
}
$(".burger").onclick=()=>$(".nav").classList.toggle("open");
document.querySelectorAll(".form-tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".form-tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll("main form").forEach(f=>f.classList.add("hide"));document.getElementById(b.dataset.show).classList.remove("hide")});
document.querySelectorAll("main form").forEach(f=>f.addEventListener("submit",e=>{e.preventDefault();submit(f)}));
const hash=location.hash.slice(1);if(["project","subscribe","engineer"].includes(hash)){document.querySelector('.form-tab[data-show="'+hash+'"]')?.click()}
})();