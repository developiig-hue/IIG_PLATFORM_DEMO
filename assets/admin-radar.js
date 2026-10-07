(()=>{"use strict";
const $=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let currentRows=[];let liveRunId=null;let radarPollEpoch=0;
const radarParams=new URLSearchParams(location.search);
let radarApiParam=radarParams.get("radar_api")||"";
let radarRunParam=radarParams.get("radar_run")||"";
// Recovery for previously issued links where "&radar_run=..." was percent-encoded inside radar_api.
if(!radarRunParam&&radarApiParam.includes("&radar_run=")){
 const parts=radarApiParam.split("&radar_run=");
 radarApiParam=parts[0]||"";
 radarRunParam=parts[1]||"";
}
const radarApiBase=/^https:\/\/[-a-z0-9]+\.trycloudflare\.com$/i.test(radarApiParam)?radarApiParam.replace(/\/$/,""):"";

async function api(url,opts={}){
 const cross=/^https:\/\//i.test(url);
 const r=await fetch(url,{credentials:cross?"omit":"same-origin",cache:"no-store",...opts,headers:{...(opts.headers||{})}});
 let data=null;try{data=await r.json()}catch{data={}};
 if(!r.ok)throw Object.assign(new Error(data.error||data.detail||("HTTP "+r.status)),{status:r.status,data});
 return data;
}
function isPages(){return location.hostname.endsWith("github.io")}
function setState(text,kind="amber"){
 const x=$("radarRunState");if(!x)return;x.textContent=text;x.classList.remove("green","red","amber","blue");x.classList.add(kind);
}
function setButtons(){
 const has=currentRows.length>0;
 if($("radarExportExcel"))$("radarExportExcel").disabled=!has;
 if($("radarResetGeneration"))$("radarResetGeneration").disabled=!has;
}
function sourceLink(url){return url?'<a href="'+esc(url)+'" target="_blank" rel="noopener">відкрити ↗</a>':"—"}
function renderRows(rows){
 currentRows=Array.isArray(rows)?rows.slice():[];
 const body=$("radarRows");if(!body)return;
 $("radarPending").textContent=currentRows.length;
 body.innerHTML=currentRows.length?currentRows.map(x=>{
   const name=x.contact_name||"Не знайдено";
   const position=x.position||"Не зазначено";
   const email=x.email||"Не знайдено";
   const relevance=x.relevance||x.signal||"Потребує ручної перевірки";
   return '<tr><td><b>'+esc(x.company_name||"Без назви")+'</b></td><td><b>'+esc(name)+'</b><br><small>'+esc(position)+'</small></td><td>'+esc(email)+'</td><td>'+esc(relevance)+'</td><td>'+sourceLink(x.source_url)+'</td></tr>';
 }).join(""):'<tr><td colspan="5">Генерацію ще не запускали.</td></tr>';
 setButtons();
}
function xmlCell(v){
 const s=String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
 return '<Cell><Data ss:Type="String">'+s+'</Data></Cell>';
}
function exportExcel(){
 if(!currentRows.length)return alert("Немає згенерованих даних для скачування.");
 const headers=["Компанія","ПІБ","Посада","Email","Країна","Галузь","Актуальність","Джерело"];
 const rows=currentRows.map(x=>[
   x.company_name||"",x.contact_name||"",x.position||"",x.email||"",x.country||"",x.industry||"",
   x.relevance||x.signal||"",x.source_url||""
 ]);
 const xml='<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'+
 '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'+
 '<Worksheet ss:Name="RADAR"><Table>'+
 '<Row>'+headers.map(xmlCell).join("")+'</Row>'+
 rows.map(r=>'<Row>'+r.map(xmlCell).join("")+'</Row>').join("")+
 '</Table></Worksheet></Workbook>';
 const blob=new Blob([xml],{type:"application/vnd.ms-excel;charset=utf-8"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);
 const d=new Date().toISOString().slice(0,10);
 a.download="IIG_RADAR_Target_Search_"+d+".xls";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href);
 $("radarRunInfo").innerHTML="<b>✓ Excel сформовано.</b> Після перевірки ADMIN_2 вручну додає потрібні контакти до загальної бази IIG. RADAR нічого не переносить автоматично.";
}
async function resetGeneration(){
 if(!currentRows.length&&!liveRunId)return;
 radarPollEpoch+=1;
 if(!confirm("Скинути поточну RADAR-генерацію? Після цього результати залишаться тільки у вже скачаному Excel."))return;
 if(radarApiBase&&liveRunId){try{await api(radarApiBase+"/api/v1/radar/test-runs/"+encodeURIComponent(liveRunId),{method:"DELETE"})}catch{}}
 liveRunId=null;currentRows=[];renderRows([]);
 setState("ГОТОВО ДО НОВОГО ПОШУКУ","blue");
 $("radarRunInfo").innerHTML="<b>✓ Генерацію скинуто.</b> Тимчасова вибірка очищена. Можна запускати новий цільовий пошук.";
}
function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
async function pollTemporaryRun(runId,epoch){
 liveRunId=runId;
 for(let i=0;i<300;i++){
   if(epoch!==radarPollEpoch)return null;
   await wait(2000);
   const x=await api(radarApiBase+"/api/v1/radar/test-runs/"+encodeURIComponent(liveRunId));
   const state=String(x.state||"").toLowerCase();
   if(state==="failed")throw new Error(x.error||"RADAR_LIVE_RUN_FAILED");
   if(state==="superseded"||state==="cancelled")return null;
   if(state==="success"){
     if(Number(x.scanned_sources||0)<1000)throw new Error("RADAR_SCAN_UNDER_1000_SOURCES");
     $("radarRunInfo").innerHTML="<b>✓ LIVE RADAR завершено:</b> оброблено "+esc(x.scanned_sources||0)+" сторінок · доменів "+esc(x.scanned_domains||0)+" · контактів "+esc(x.count||0)+".";
     return Array.isArray(x.rows)?x.rows:[];
   }
   setState("LIVE ПОШУК…","amber");
   $("radarRunInfo").innerHTML="<b>LIVE RADAR працює.</b> Реальний web-crawl виконується на тимчасовому backend. Run: "+esc(liveRunId);
 }
 throw new Error("RADAR_LIVE_RUN_TIMEOUT");
}
async function runTemporaryBackend(payload,epoch){
 const started=await api(radarApiBase+"/api/v1/radar/test-runs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
 return await pollTemporaryRun(started.id,epoch);
}
async function start(){
 const query=$("radarQuery")?.value.trim()||"",industry=$("radarIndustry")?.value||"",country=$("radarCountry")?.value.trim()||"",limit=Number($("radarLimit")?.value||20);
 if(query.length<3)return alert("Опишіть, яких потенційних клієнтів потрібно знайти.");
 radarPollEpoch+=1;
 const myEpoch=radarPollEpoch;
 currentRows=[];renderRows([]);setState("ПОШУК…","amber");
 try{
   let rows=[];
   const payload={query,industry,country,limit,min_sources:1000,deep_scan:true};
   if(isPages()){
     if(!radarApiBase)throw new Error("LIVE_RADAR_REQUIRES_PRIVATE_BACKEND");
     rows=await runTemporaryBackend(payload,myEpoch);
     if(rows===null||myEpoch!==radarPollEpoch)return;
   }else{
     const x=await api("/api/v1/radar/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
     rows=Array.isArray(x.rows)?x.rows:[];
     if(Number(x.scanned_sources||0)<1000)throw new Error("RADAR_SCAN_UNDER_1000_SOURCES");
   }
   renderRows(rows);
   setState("✓ ЗГЕНЕРОВАНО · "+rows.length,"green");
   $("radarRunInfo").innerHTML+="<br><b>Результат готовий:</b> перевірте ФІО/посаду/email/актуальність, скачайте Excel і після цього скиньте генерацію.";
 }catch(e){
   if(myEpoch!==radarPollEpoch)return;
   renderRows([]);setState("ПОМИЛКА","red");
   $("radarRunInfo").innerHTML="<b>RADAR не виконав пошук:</b> "+esc(e.data?.detail||e.data?.error||e.message);
 }
}
$("radarStartRobot")&&($("radarStartRobot").onclick=start);
$("radarExportExcel")&&($("radarExportExcel").onclick=exportExcel);
$("radarResetGeneration")&&($("radarResetGeneration").onclick=resetGeneration);
renderRows([]);
setState(isPages()?(radarApiBase?"LIVE RADAR · ПІДКЛЮЧЕНО":"LIVE RADAR · BACKEND REQUIRED"):"READY · 1000+ SOURCES","blue");
if(isPages()&&$("radarRunInfo"))$("radarRunInfo").innerHTML=radarApiBase?"<b>✓ LIVE RADAR backend підключено.</b> Можна запускати реальний web-crawl через ADMIN MASTER.":"<b>LIVE RADAR:</b> для реального web-scan потрібне підключення backend.";
if(isPages()&&radarApiBase&&radarRunParam){
 setState("LIVE RUN · ПІДКЛЮЧЕННЯ…","amber");
 radarPollEpoch+=1;
 const initialEpoch=radarPollEpoch;
 pollTemporaryRun(radarRunParam,initialEpoch).then(rows=>{
   if(rows===null||initialEpoch!==radarPollEpoch)return;
   renderRows(rows);setState("✓ ЗГЕНЕРОВАНО · "+rows.length,"green");
   $("radarRunInfo").innerHTML+="<br><b>Результат готовий:</b> можна перевірити контакти та скачати Excel.";
 }).catch(e=>{
   if(initialEpoch!==radarPollEpoch)return;
   renderRows([]);setState("ПОМИЛКА","red");
   $("radarRunInfo").innerHTML="<b>Не вдалося підключити LIVE RADAR run:</b> "+esc(e.data?.detail||e.data?.error||e.message);
 });
}
})();