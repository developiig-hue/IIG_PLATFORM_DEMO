(()=>{"use strict";
const DEMO_KEY="iig.demo.requests.v31";
const TYPES=["project","engineer","subscribe"];
const LABEL={project:"РОЗМІСТИТИ ПРОЄКТ",engineer:"ЗАДАТИ ПИТАННЯ ГОЛОВНОМУ ІНЖЕНЕРУ",subscribe:"ПІДПИСКА НА DIGEST"};
const PREFIX={project:"project",engineer:"engineer",subscribe:"subscribe"};
const $=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let mode="LOADING",rows=[],stats={},role="ADMIN_2";
function localRows(){try{return JSON.parse(localStorage.getItem(DEMO_KEY)||"[]")}catch{return[]}}
function saveLocal(xs){localStorage.setItem(DEMO_KEY,JSON.stringify(xs))}
const counts=xs=>({total:xs.length,new:xs.filter(x=>!x.processed_at).length,downloaded:xs.filter(x=>x.downloaded_at).length,processed:xs.filter(x=>x.processed_at).length,promoted:xs.filter(x=>x.promoted_at).length});
function computeStats(xs){return {all:counts(xs),project:counts(xs.filter(x=>x.type==="project")),engineer:counts(xs.filter(x=>x.type==="engineer")),subscribe:counts(xs.filter(x=>x.type==="subscribe"))}}
function fmtDate(v){if(!v)return"—";try{return new Date(v).toLocaleString("uk-UA")}catch{return v}}
function field(k,v){return '<div class="reqfield"><small>'+esc(k)+'</small><b>'+esc(v||"—")+'</b></div>'}
function requestCard(r){
 const downloaded=!!r.downloaded_at,processed=!!r.processed_at,promoted=!!r.promoted_at;
 const details=[
  field("Дата заявки",fmtDate(r.received_at)),field("Ім’я",r.name),field("Компанія",r.company),field("E-mail",r.email),
  field("Телефон / Посада",r.phone||r.position),field("Галузь / Мова",r.industry||r.language),field("Технологія",r.solution),
  field("Запит",r.message||(r.type==="subscribe"?"Підписка на IIG Monthly Digest":"—")),field("Згода",r.consent_text||"Підтверджено")
 ].join("");
 return '<article class="requestcard processingcard '+(processed?"processed":"")+'"><div class="requestid"><b>'+esc(r.id)+'</b><span class="pill '+(processed?"green":downloaded?"blue":"amber")+'">'+(processed?"ОБРОБЛЕНО":downloaded?"ЗАВАНТАЖЕНО":"НОВА")+'</span></div><div class="requestfields">'+details+'</div>'+
 '<div class="requestaudit"><span>Завантажено: <b>'+esc(fmtDate(r.downloaded_at))+'</b></span><span>ADMIN: <b>'+esc(r.downloaded_by||"—")+'</b></span><span>Оброблено: <b>'+esc(fmtDate(r.processed_at))+'</b></span></div>'+
 '<label class="processedcheck '+(!downloaded?"disabled":"")+'"><input type="checkbox" class="markProcessed" data-id="'+esc(r.id)+'" '+(processed?"checked":"")+' '+(!downloaded||role!=="ADMIN_2"?"disabled":"")+'> ADMIN_2 · дані оброблено</label>'+
 (processed?'<button class="btn primary '+(promoted?"openContactBase":"promoteContact")+'" data-id="'+esc(r.id)+'">'+(promoted?"✓ У БАЗІ IIG":"→ ПЕРЕДАТИ ДО БАЗИ КОНТАКТІВ IIG")+'</button>':'')+
 (!downloaded?'<div class="reqhint">Спочатку скачайте Excel цієї колонки. До цього заявка не може вважатися обробленою.</div>':'')+'</article>';
}
function render(){
 stats=computeStats(rows);
 for(const type of TYPES){
  const p=PREFIX[type],xs=rows.filter(x=>x.type===type).sort((a,b)=>String(b.received_at).localeCompare(String(a.received_at))),s=stats[type];
  $(p+"Total").textContent=s.total;$(p+"Pending").textContent=s.new;$(p+"Processed").textContent=s.processed;$(p+"Downloaded").textContent=s.downloaded;
  $(p+"RequestList").innerHTML=xs.length?xs.map(requestCard).join(""):'<div class="empty">Заявок ще немає.</div>';
 }
 $("requestsAllTotal").textContent=stats.all.total;
 $("requestsAllPending").textContent=stats.all.new;
 $("requestsAllProcessed").textContent=stats.all.processed;
 $("requestsSourceMode").textContent=mode==="BACKEND"?"PRODUCTION BACKEND":"DEMO · ЦЕЙ БРАУЗЕР";
 document.querySelectorAll(".markProcessed").forEach(x=>x.onchange=()=>toggleProcessed(x.dataset.id,x.checked,x));
 document.querySelectorAll(".promoteContact").forEach(x=>x.onclick=()=>promote(x.dataset.id,x));document.querySelectorAll(".openContactBase").forEach(x=>x.onclick=()=>{const r=rows.find(y=>y.id===x.dataset.id);if(r&&window.IIGContacts?.focusContact)window.IIGContacts.focusContact(r.email);else location.hash="#mailing"});
}
async function refresh(){
 try{
  const r=await fetch("/api/v1/requests",{credentials:"same-origin",cache:"no-store"});
  if(!r.ok)throw Error("HTTP "+r.status);
  const d=await r.json();rows=Array.isArray(d.rows)?d.rows:[];mode="BACKEND";
 }catch(e){rows=localRows();mode="DEMO"}
 render();
}
function xmlEsc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function excelXml(type,xs){
 const heads=["ID","Тип","Дата отримання","Ім’я","Компанія","E-mail","Телефон / Посада","Галузь / Мова","Технологія","Текст звернення","Згода","Завантажено","Оброблено","Обробив","Передано до бази IIG"];
 const cell=v=>'<Cell><Data ss:Type="String">'+xmlEsc(v)+'</Data></Cell>',tr=a=>'<Row>'+a.map(cell).join("")+'</Row>';
 return '<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="'+xmlEsc(type)+'"><Table>'+tr(heads)+xs.map(x=>tr([x.id,x.type,x.received_at,x.name,x.company,x.email,x.phone||x.position||"",x.industry||x.language||"",x.solution||"",x.message||"",x.consent_text||"",x.downloaded_at||"",x.processed_at||"",x.processed_by||"",x.promoted_at||""])).join("")+'</Table></Worksheet></Workbook>';
}
function downloadBlob(type,xs){
 const blob=new Blob([excelXml(type,xs)],{type:"application/vnd.ms-excel;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="IIG_"+type+"_requests_"+new Date().toISOString().slice(0,10)+".xls";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
}
async function exportType(type){
 if(mode==="BACKEND"){
   const r=await fetch("/api/v1/requests/export/"+encodeURIComponent(type)+".xls",{credentials:"same-origin"});
   if(!r.ok){alert("Не вдалося сформувати Excel: HTTP "+r.status);return}
   const b=await r.blob(),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="IIG_"+type+"_requests_"+new Date().toISOString().slice(0,10)+".xls";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);await refresh();return;
 }
 const now=new Date().toISOString(),xs=rows.filter(x=>x.type===type);for(const x of xs){if(!x.downloaded_at){x.downloaded_at=now;x.downloaded_by="ADMIN_2"}}saveLocal(rows);downloadBlob(type,xs);render();
}
async function toggleProcessed(id,processed,box){
 const r=rows.find(x=>x.id===id);if(!r)return;if(!r.downloaded_at){box.checked=false;alert("Спочатку скачайте Excel. Без факту download заявка не може бути оброблена.");return}
 if(role!=="ADMIN_2"){box.checked=!processed;alert("Позначку «Оброблено» ставить ADMIN_2.");return}
 if(mode==="BACKEND"){
  const res=await fetch("/api/v1/requests/"+encodeURIComponent(id)+"/processed",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({processed})});
  if(!res.ok){box.checked=!processed;const d=await res.json().catch(()=>({}));alert(d.error||("HTTP "+res.status));return}
  await refresh();return;
 }
 r.processed_at=processed?new Date().toISOString():null;r.processed_by=processed?"ADMIN_2":null;r.status=processed?"PROCESSED":"NEW";saveLocal(rows);render();
}
async function promote(id,button){
 const r=rows.find(x=>x.id===id);if(!r||!r.processed_at)return;
 if(mode==="BACKEND"){
  const res=await fetch("/api/v1/requests/"+encodeURIComponent(id)+"/promote-contact",{method:"POST",credentials:"same-origin"});
  if(!res.ok){const d=await res.json().catch(()=>({}));alert(d.error||("HTTP "+res.status));return}await refresh();return;
 }
 if(window.IIGContacts?.ingestRequest){
  const marketing=r.type==="subscribe";
  window.IIGContacts.ingestRequest({email:r.email,name:r.name,company:r.company,position:r.position||"",source:"Website form "+r.id,language:r.language||"UA",marketingConsent:marketing,consentEvidence:marketing?(r.consent_text+" · "+r.received_at):"",status:""});
 }
 r.promoted_at=new Date().toISOString();r.promoted_by="ADMIN_2";saveLocal(rows);render();
}
for(const type of TYPES){$(PREFIX[type]+"Export").onclick=()=>exportType(type)}
$("requestsRefresh").onclick=refresh;
if($("requestsRole"))$("requestsRole").onchange=e=>{role=e.target.value;render()};
refresh();setInterval(()=>{if(location.hash==="#requests")refresh()},30000);
})();