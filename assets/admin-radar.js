(()=>{"use strict";
const $=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let currentRows=[];

async function api(url,opts={}){
 const r=await fetch(url,{credentials:"same-origin",cache:"no-store",...opts,headers:{...(opts.headers||{})}});
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
function resetGeneration(){
 if(!currentRows.length)return;
 if(!confirm("Скинути поточну RADAR-генерацію? Після цього результати залишаться тільки у вже скачаному Excel."))return;
 currentRows=[];
 renderRows([]);
 setState("ГОТОВО ДО НОВОГО ПОШУКУ","blue");
 $("radarRunInfo").innerHTML="<b>✓ Генерацію скинуто.</b> Тимчасова вибірка очищена. Можна запускати новий цільовий пошук.";
}
async function start(){
 const query=$("radarQuery")?.value.trim()||"",industry=$("radarIndustry")?.value||"",country=$("radarCountry")?.value.trim()||"",limit=Number($("radarLimit")?.value||20);
 if(query.length<3)return alert("Опишіть, яких потенційних клієнтів потрібно знайти.");
 // Every run replaces the previous transient set.
 currentRows=[];renderRows([]);setState("ПОШУК…","amber");
 try{
   let rows=[];
   if(isPages()){
     throw new Error("LIVE_RADAR_REQUIRES_PRIVATE_BACKEND");
   }else{
     const x=await api("/api/v1/radar/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query,industry,country,limit,min_sources:1000,deep_scan:true})});
     rows=Array.isArray(x.rows)?x.rows:[];
     if(Number(x.scanned_sources||0)<1000)throw new Error("RADAR_SCAN_UNDER_1000_SOURCES");
   }
   renderRows(rows);
   setState("✓ ЗГЕНЕРОВАНО · "+rows.length,"green");
   $("radarRunInfo").innerHTML="<b>✓ Цільовий пошук завершено:</b> "+esc(rows.length)+" результатів. Перевірте ФІО/посаду/email/актуальність, скачайте Excel і після цього скиньте генерацію.";
 }catch(e){
   renderRows([]);setState("ПОМИЛКА","red");
   $("radarRunInfo").innerHTML="<b>RADAR не виконав пошук:</b> "+esc(e.data?.detail||e.data?.error||e.message);
 }
}
$("radarStartRobot")&&($("radarStartRobot").onclick=start);
$("radarExportExcel")&&($("radarExportExcel").onclick=exportExcel);
$("radarResetGeneration")&&($("radarResetGeneration").onclick=resetGeneration);
renderRows([]);
setState(isPages()?"LIVE RADAR · BACKEND REQUIRED":"READY · 1000+ SOURCES","blue");
if(isPages()&&$("radarRunInfo"))$("radarRunInfo").innerHTML="<b>LIVE RADAR:</b> GitHub Pages не виконує реальний масовий web-scan. Вигадані DEMO-контакти вимкнено. На paid-hosting запуск вважається успішним тільки якщо backend підтвердив обхід мінімум 1000 зовнішніх джерел.";
})();