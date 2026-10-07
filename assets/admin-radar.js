(()=>{"use strict";
const $=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let currentRunKey=null,pollTimer=null;
async function api(url,opts={}){
 const r=await fetch(url,{credentials:"same-origin",cache:"no-store",...opts,headers:{...(opts.headers||{})}});
 let data=null;try{data=await r.json()}catch{data={}};
 if(!r.ok)throw Object.assign(new Error(data.error||data.detail||("HTTP "+r.status)),{status:r.status,data});
 return data;
}
function setState(text,kind="amber"){
 const x=$("radarRunState");if(!x)return;
 x.textContent=text;x.classList.remove("green","red","amber","blue");x.classList.add(kind);
}
function isPages(){return location.hostname.endsWith("github.io")}
function sourceLink(url){
 if(!url)return "—";
 const safe=String(url);return '<a href="'+esc(safe)+'" target="_blank" rel="noopener">відкрити джерело ↗</a>';
}
function renderRows(rows){
 const body=$("radarRows");if(!body)return;
 $("radarPending").textContent=rows.length;
 body.innerHTML=rows.length?rows.map(x=>{
  const contact=[x.contact_name||"",x.email||""].filter(Boolean).map(esc).join("<br>")||"—";
  const signal=[x.signal||"",x.industry||"",x.country||"",x.confidence!=null?("confidence "+x.confidence):""].filter(Boolean).map(esc).join(" · ");
  const demo=isPages();
  return '<tr><td><b>'+esc(x.company_name||"Без назви")+'</b><br><small>'+signal+'</small></td><td>'+contact+'</td><td>'+sourceLink(x.source_url)+'</td><td><button class="iconbtn radarPromoteServer" data-id="'+esc(x.id)+'">'+(demo?'Перевірено':'До бази IIG')+'</button> <button class="iconbtn radarRejectServer" data-id="'+esc(x.id)+'">Відхилити</button></td></tr>';
 }).join(""):'<tr><td colspan="4">Нових пропозицій RADAR немає.</td></tr>';
 document.querySelectorAll(".radarPromoteServer").forEach(b=>b.onclick=()=>promote(b.dataset.id));
 document.querySelectorAll(".radarRejectServer").forEach(b=>b.onclick=()=>reject(b.dataset.id));
}
async function loadProspects(){
 if(isPages())return;
 try{
  const x=await api("/api/v1/radar/prospects?state=pending&limit=100");
  renderRows(Array.isArray(x.rows)?x.rows:[]);
 }catch(e){
  $("radarRunInfo").innerHTML="<b>RADAR:</b> не вдалося отримати кандидатів · "+esc(e.data?.detail||e.data?.error||e.message);
 }
}
async function start(){
 const query=$("radarQuery")?.value.trim()||"",industry=$("radarIndustry")?.value||"",country=$("radarCountry")?.value.trim()||"",limit=Number($("radarLimit")?.value||20);
 if(query.length<3)return alert("Опишіть, яких потенційних клієнтів потрібно знайти.");
 if(isPages()){
   setState("TEST SEARCH…","amber");
   try{
     const r=await fetch("data/radar-test-latest.json",{cache:"no-store"});
     if(!r.ok)throw new Error("TEST_RADAR_DATA_UNAVAILABLE");
     const x=await r.json(),rows=(Array.isArray(x.rows)?x.rows:[]).filter(y=>{
       const sameIndustry=!industry||industry==="other"||String(y.industry||"").toLowerCase()===String(industry).toLowerCase();
       const sameCountry=!country||String(y.country||"").toLowerCase()===String(country).toLowerCase();
       return sameIndustry&&sameCountry;
     }).slice(0,limit);
     renderRows(rows);
     setState("✓ TEST SUCCESS · "+rows.length,"green");
     $("radarRunInfo").innerHTML="<b>✓ DEMO TEST RADAR завершено:</b> знайдено "+esc(rows.length)+" кандидатів · галузь "+esc(industry||"all")+" · ринок "+esc(country||"all")+"<br><small>Джерела перевіряються через публічний тестовий snapshot. На paid hosting ця ж кнопка запускає приватний backend і live search-provider.</small>";
   }catch(e){
     setState("TEST FAILED","red");
     $("radarRunInfo").innerHTML="<b>DEMO TEST RADAR:</b> "+esc(e.message);
   }
   return;
 }
 setState("ЗАПУСК…","amber");
 try{
   const x=await api("/api/v1/radar/runs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query,industry,country,limit})});
   currentRunKey=x.run_key;setState("QUEUED","amber");
   $("radarRunInfo").innerHTML="<b>RADAR запущено:</b> "+esc(currentRunKey)+"<br>Запит: "+esc(query);
   startPolling();
 }catch(e){
   setState("ПОМИЛКА","red");
   $("radarRunInfo").innerHTML="<b>RADAR не запущено:</b> "+esc(e.data?.detail||e.data?.error||e.message);
 }
}
async function poll(){
 if(!currentRunKey||isPages())return;
 try{
   const x=await api("/api/v1/radar/runs/"+encodeURIComponent(currentRunKey));
   const state=String(x.state||"").toLowerCase(),kind=state==="success"?"green":state==="failed"?"red":"amber";
   setState(state.toUpperCase(),kind);
   $("radarRunInfo").innerHTML="<b>Run:</b> "+esc(currentRunKey)+" · "+esc(state.toUpperCase())+" · кандидатів: "+esc(x.prospects||0);
   if(state==="success"||state==="failed"){
     clearInterval(pollTimer);pollTimer=null;await loadProspects();
   }
 }catch(e){
   setState("STATUS ERROR","red");
 }
}
function startPolling(){if(pollTimer)clearInterval(pollTimer);pollTimer=setInterval(poll,2500);void poll()}
async function promote(id){
 if(isPages())return alert("DEMO TEST: кандидат показаний для перевірки джерела. Реальне перенесення до CRM виконується тільки через production backend і створює PENDING, не ACTIVE.");
 if(!confirm("Перевірено джерело? Передати цей RADAR-контакт до єдиної бази IIG як PENDING?"))return;
 try{
   await api("/api/v1/radar/prospects/"+encodeURIComponent(id)+"/decision",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({decision:"approved"})});
   const x=await api("/api/v1/radar/prospects/"+encodeURIComponent(id)+"/promote",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
   $("radarRunInfo").innerHTML="<b>✓ Передано до бази IIG:</b> CRM lead "+esc(x.lead_id)+" · mailing status "+esc(x.mailing_status);
   await loadProspects();
 }catch(e){alert("Не вдалося передати контакт: "+(e.data?.detail||e.data?.error||e.message))}
}
async function reject(id){
 if(isPages()){const b=document.querySelector('.radarRejectServer[data-id="'+CSS.escape(String(id))+'"]');if(b){const tr=b.closest("tr");tr&&tr.remove();$("radarPending").textContent=document.querySelectorAll("#radarRows tr").length}return}
 if(!confirm("Відхилити цього кандидата RADAR?"))return;
 try{await api("/api/v1/radar/prospects/"+encodeURIComponent(id)+"/decision",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({decision:"rejected"})});await loadProspects()}
 catch(e){alert("Не вдалося відхилити: "+(e.data?.detail||e.data?.error||e.message))}
}
$("radarStartRobot")&&($("radarStartRobot").onclick=start);
$("radarRefreshRobot")&&($("radarRefreshRobot").onclick=()=>{void loadProspects();if(currentRunKey)void poll()});
if(isPages()){
 setState("DEMO TEST · READY","blue");
 $("radarRunInfo").innerHTML="<b>DEMO TEST RADAR READY:</b> натисніть «ЗАПУСТИТИ RADAR · ADMIN_2», щоб виконати тестовий пошук по актуальному публічному snapshot. На paid hosting ця ж кнопка запускає live backend.";
}else{void loadProspects()}
})();