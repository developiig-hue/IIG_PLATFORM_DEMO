(()=>{"use strict";
const $=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),key=x=>String(x||"").trim().toLowerCase();
const CONTACTS_KEY="iig.demo.contacts.v32",REQUESTS_KEY="iig.demo.requests.v31";
let contacts=[],proposals=[],serial=0,lastDup=0,lastInvalid=0;let selectedRecipientFile=null;
function loadStoredContacts(){try{const xs=JSON.parse(localStorage.getItem(CONTACTS_KEY)||"[]");return Array.isArray(xs)?xs:[]}catch{return[]}}
function saveStoredContacts(){try{localStorage.setItem(CONTACTS_KEY,JSON.stringify(contacts))}catch{}}
function bootstrapPromotedRequests(){
 try{
  const reqs=JSON.parse(localStorage.getItem(REQUESTS_KEY)||"[]");if(!Array.isArray(reqs))return;
  for(const r of reqs.filter(x=>x&&x.promoted_at&&x.email)){
   if(contacts.some(x=>x.email===key(r.email)))continue;
   const marketing=r.type==="subscribe";
   const x=normalize({email:r.email,name:r.name,company:r.company,position:r.position||"",source:"Website form "+r.id,language:r.language||"UA",consent:marketing?"yes":"",consent_evidence:marketing?((r.consent_text||"")+" · "+(r.received_at||"")):""});
   if(marketing&&x.consentEvidence)x.status="active"; else x.status="pending";
   contacts.push(x);
  }
 }catch{}
}
const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
function consent(v){return /^(yes|true|1|active|так|підтверджено)$/i.test(String(v||"").trim())}
function blocked(v){return /^(unsubscribed|suppressed|bounced|blocked|відписано|заблоковано)$/i.test(String(v||"").trim())}
function normalize(x){const statusRaw=x.status||x["статус_розсилки"]||"";const consentRaw=x.marketing_consent===true?"yes":(x.consent||x["статус_згоди"]||"");return{id:x.id||++serial,email:key(x.email||x["e-mail"]),name:x.name||x["ім’я"]||"",company:x.company||x["компанія"]||"",position:x.position||x["посада"]||"",source:x.source||x["джерело"]||"Імпорт",lang:x.language||x.lang||x["мова"]||"UA",status:blocked(statusRaw)||x.unsubscribed_at?"blocked":consent(consentRaw)&&!blocked(statusRaw)?"active":"pending",consentEvidence:x.consent_evidence||x["підтвердження_згоди"]||"",unsubscribedAt:x.unsubscribed_at||"",unsubscribeReason:x.unsubscribe_reason||"",note:x.note||""}}
function status(x){return x.status==="active"?'<span class="pill green">ACTIVE · згода підтверджена</span>':x.status==="blocked"?'<span class="pill red">UNSUBSCRIBE / SUPPRESSED</span>':'<span class="pill amber">PENDING · очікує згоди</span>'}
function stats(){const active=contacts.filter(x=>x.status==="active");$("campaignRecipients").textContent=active.length;$("rcRows").textContent=contacts.length;$("rcValid").textContent=contacts.filter(x=>validEmail(x.email)).length;$("rcInvalid").textContent=lastInvalid;$("rcDup").textContent=lastDup;$("recipientRows").innerHTML=active.slice(0,50).map(x=>"<tr><td>"+esc(x.email)+"</td><td>"+esc(x.name)+"</td><td>"+esc(x.lang)+"</td><td>ACTIVE</td></tr>").join("")||'<tr><td colspan="4">Немає контактів, дозволених до розсилки.</td></tr>'}
function render(){saveStoredContacts();const q=key($("contactSearch").value),f=$("contactFilter").value,rows=contacts.filter(x=>(f==="all"||x.status===f)&&key(x.name+" "+x.company+" "+x.email).includes(q));$("contactRows").innerHTML=rows.map(x=>'<tr><td><b>'+esc(x.name||"Без імені")+'</b><br><small>'+esc(x.company)+'</small></td><td>'+esc(x.email)+'</td><td>'+status(x)+'</td><td><button class="iconbtn editContact" data-id="'+x.id+'">Редагувати</button></td></tr>').join("")||'<tr><td colspan="4">Контактів не знайдено.</td></tr>';document.querySelectorAll(".editContact").forEach(b=>b.onclick=()=>edit(+b.dataset.id));stats()}
function edit(id){let x=contacts.find(y=>y.id===id);if(!x){x=normalize({});contacts.push(x)}const name=prompt("Ім’я та прізвище",x.name);if(name===null)return;const email=prompt("Email",x.email);if(email===null)return;const e=key(email);if(!validEmail(e))return alert("Некоректна адреса email.");if(contacts.some(y=>y!==x&&y.email===e))return alert("Контакт з такою адресою вже існує.");x.name=name;x.email=e;x.company=prompt("Організація",x.company)||x.company;x.position=prompt("Посада",x.position)||x.position;x.lang=/^EN$/i.test(prompt("Мова (UA / EN)",x.lang)||"UA")?"EN":"UA";if(x.status==="active")x.status="pending";const d=prompt("Статус: 1 — PENDING; 2 — SUPPRESSED; 3 — ACTIVE (потрібне підтвердження)","1");if(d==="2")x.status="blocked";if(d==="3"){const evidence=prompt("Джерело й дата підтвердженої згоди","");if(evidence&&evidence.trim()){x.consentEvidence=evidence.trim();x.status="active"}else alert("Без доказу згоди контакт залишається PENDING.")}render()}
function parseCSV(s){const lines=s.replace(/^\uFEFF/,"").split(/\r?\n/).filter(x=>x.trim());if(!lines.length)return[];const sep=(lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?";":",";function cells(line){let a=[],cur="",q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else q=!q}else if(c===sep&&!q){a.push(cur.trim());cur=""}else cur+=c}a.push(cur.trim());return a}const headers=cells(lines[0]).map(key),map={"e-mail":"email","ім’я":"name","імя":"name","назва":"company","організація":"company","компанія":"company","посада":"position","джерело":"source","мова":"language","згода":"consent","статус_згоди":"consent","статус_розсилки":"status","підтвердження":"consent_evidence","підтвердження_згоди":"consent_evidence"};return lines.slice(1).map(l=>Object.fromEntries(cells(l).map((v,i)=>[map[headers[i]]||headers[i],v]))).filter(x=>x.email)}
function merge(rows,radar){lastDup=0;lastInvalid=0;let added=0;for(const row of rows){const x=normalize(row);if(!validEmail(x.email)){lastInvalid++;continue}const existing=contacts.find(y=>y.email===x.email);if(existing||proposals.some(y=>y.email===x.email)){lastDup++;continue}if(radar){x.status="pending";proposals.push(x)}else{if(x.status==="active"&&!x.consentEvidence)x.status="pending";contacts.push(x)}added++}render();renderRadar();alert("Додано: "+added+"; дублікати: "+lastDup+"; некоректні: "+lastInvalid+".")}
function readFile(file,radar){if(!file)return;if(file.size>5*1024*1024)return alert("Ліміт файлу — 5 МБ.");const ext=file.name.toLowerCase();if(ext.endsWith(".xlsx")){const s=$("xlsxStatus");if(s)s.innerHTML="<b>MASTER XLSX прийнято:</b> "+esc(file.name)+"<br>Файл не відправляється в GitHub і не публікується. На STEP 26 перевірено тип XLSX; читання персональних рядків і запис у приватну DB активуються тільки через захищений backend.";return}const reader=new FileReader();reader.onload=()=>{try{const txt=String(reader.result||""),data=ext.endsWith(".json")?JSON.parse(txt):parseCSV(txt);const s=$("xlsxStatus");if(s&&!radar)s.innerHTML="<b>CSV перевірено локально:</b> "+esc(file.name)+"<br>Дані існують лише у пам’яті цієї вкладки.";if(!Array.isArray(data))throw Error("очікується масив контактів");merge(data,radar)}catch(e){alert("Помилка імпорту: "+e.message)}};reader.readAsText(file)}
async function importRecipientBase(){
 const file=selectedRecipientFile||$("recipientFile")?.files?.[0],state=$("recipientImportState"),box=$("xlsxStatus");
 if(!file)return alert("Спочатку виберіть затверджену базу IIG у XLSX/CSV.");
 if(file.size>10*1024*1024)return alert("Ліміт файлу — 10 МБ.");
 if(state){state.textContent="ІМПОРТ…";state.classList.remove("green","red");state.classList.add("amber")}
 const ext=file.name.toLowerCase();
 if(location.hostname.endsWith("github.io")){
   if(ext.endsWith(".csv")){
     const txt=await file.text(),data=parseCSV(txt);merge(data,false);
     if(state){state.textContent="DEMO · CSV ПЕРЕВІРЕНО ЛОКАЛЬНО";state.classList.add("green")}
     if(box)box.innerHTML="<b>DEMO:</b> CSV злитий з локальною базою цього браузера. На paid hosting цей самий файл імпортує захищений backend від імені ADMIN_2.";
   }else{
     if(state){state.textContent="DEMO · XLSX ГОТОВИЙ ДО SERVER IMPORT";state.classList.add("blue")}
     if(box)box.innerHTML="<b>MASTER XLSX вибрано:</b> "+esc(file.name)+"<br>GitHub Pages не читає персональні XLSX-рядки. На production ADMIN_2 натискає цю ж кнопку, backend перевіряє та зливає базу за e-mail.";
   }
   return;
 }
 const fd=new FormData();fd.append("file",file,file.name);
 try{
   const r=await fetch("/api/v1/contacts/import",{method:"POST",credentials:"same-origin",body:fd});
   const x=await r.json().catch(()=>({}));
   if(!r.ok)throw Object.assign(new Error(x.error||("HTTP "+r.status)),{data:x});
   if(state){state.textContent="✓ ІМПОРТОВАНО ADMIN_2";state.classList.remove("amber","red");state.classList.add("green")}
   if(box)box.innerHTML="<b>Базу оновлено:</b> "+esc(file.name)+"<br>Рядків: "+esc(x.total)+" · додано: "+esc(x.added)+" · оновлено: "+esc(x.updated)+" · некоректні: "+esc(x.invalid)+" · збережено SUPPRESSED: "+esc(x.preserved_suppressed)+".";
   await loadBackendContacts();
 }catch(e){
   if(state){state.textContent="ПОМИЛКА ІМПОРТУ";state.classList.remove("amber","green");state.classList.add("red")}
   if(box)box.innerHTML="<b>Імпорт не виконано:</b> "+esc(e.data?.error||e.message);
 }
}
function baseExcelXml(){
 const heads=["ID","Email","Ім’я","Компанія","Посада","Джерело","Мова","Статус","Підтвердження згоди","Примітка"];
 const xml=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 const cell=v=>'<Cell><Data ss:Type="String">'+xml(v)+'</Data></Cell>',row=a=>'<Row>'+a.map(cell).join("")+'</Row>';
 return '<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="IIG Contacts"><Table>'+row(heads)+contacts.map(x=>row([x.id,x.email,x.name,x.company,x.position,x.source,x.lang,x.status,x.consentEvidence,x.note])).join("")+'</Table></Worksheet></Workbook>';
}
function exportContactsBase(){
 const blob=new Blob([baseExcelXml()],{type:"application/vnd.ms-excel;charset=utf-8"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download="IIG_Contacts_Master_"+new Date().toISOString().slice(0,10)+".xls";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
}
async function loadBackendContacts(){
 try{
  const r=await fetch("/api/v1/contacts",{credentials:"same-origin",cache:"no-store"});if(!r.ok)return false;
  const d=await r.json(),xs=Array.isArray(d.rows)?d.rows:[];
  contacts=xs.map(normalize);saveStoredContacts();render();return true;
 }catch{return false}
}
function focusContact(email){
 location.hash="#mailing";const s=$("contactSearch");if(s){s.value=email||"";render();setTimeout(()=>s.scrollIntoView({behavior:"smooth",block:"center"}),50)}
}
function renderRadar(){$("radarPending").textContent=proposals.length;$("radarRows").innerHTML=proposals.map(x=>'<tr><td><b>'+esc(x.name||x.company||"Контакт")+'</b><br><small>'+esc(x.company)+" · "+esc(x.source)+'</small></td><td>'+esc(x.email)+'</td><td><button class="iconbtn radarAccept" data-id="'+x.id+'">До бази</button> <button class="iconbtn radarReject" data-id="'+x.id+'">Відхилити</button></td></tr>').join("")||'<tr><td colspan="3">Нових пропозицій немає.</td></tr>';document.querySelectorAll(".radarAccept").forEach(b=>b.onclick=()=>{const i=proposals.findIndex(x=>x.id===+b.dataset.id);if(i<0)return;const x=proposals.splice(i,1)[0];x.status="pending";contacts.push(x);renderRadar();render()});document.querySelectorAll(".radarReject").forEach(b=>b.onclick=()=>{proposals=proposals.filter(x=>x.id!==+b.dataset.id);renderRadar()})}
$("contactSearch").oninput=render;$("contactFilter").onchange=render;$("addContact").onclick=()=>edit(-1);if($("exportContactsBase"))$("exportContactsBase").onclick=exportContactsBase;if($("radarFile"))$("radarFile").onchange=e=>readFile(e.target.files[0],true);if($("recipientFile"))$("recipientFile").onchange=e=>{selectedRecipientFile=e.target.files[0]||null;const s=$("recipientImportState");if(s){s.textContent=selectedRecipientFile?("ВИБРАНО · "+selectedRecipientFile.name):"ФАЙЛ НЕ ВИБРАНО";s.classList.remove("green","red");s.classList.add("amber")}};if($("importRecipientBase"))$("importRecipientBase").onclick=importRecipientBase;
$("mailDryRun").onclick=()=>{const a=contacts.filter(x=>x.status==="active").length,p=contacts.filter(x=>x.status==="pending").length,b=contacts.filter(x=>x.status==="blocked").length;$("mailCheck").innerHTML="<b>Перевірка кампанії:</b><br>• ACTIVE: "+a+"<br>• PENDING: "+p+" — виключені<br>• SUPPRESSED: "+b+" — виключені<br>• Exact Digest SHA: потрібен production approval<br>• Unsubscribe/suppression endpoint: НЕ ПІДКЛЮЧЕНО<br>• Email transport: НЕ ПІДКЛЮЧЕНО<br><b>Результат: START MAILING ЗАБЛОКОВАНО до КРОКУ 27.</b>"};
window.IIGContacts={focusContact,exportContactsBase,ingestRequest(r){const x=normalize(r||{});if(!validEmail(x.email))return{ok:false,reason:"invalid_email"};const old=contacts.find(y=>y.email===x.email);if(old){old.name=x.name||old.name;old.company=x.company||old.company;old.position=x.position||old.position;old.source=x.source||old.source;old.lang=x.lang||old.lang;if(r.unsubscribe===true||r.status==="suppressed"){old.status="blocked";old.consentEvidence="UNSUBSCRIBE"}else if(r.marketingConsent===true&&r.consentEvidence){old.status="active";old.consentEvidence=r.consentEvidence}render();return{ok:true,updated:true,status:old.status}}if(r.unsubscribe===true||r.status==="suppressed"){x.status="blocked";x.consentEvidence="UNSUBSCRIBE"}else if(r.marketingConsent===true&&r.consentEvidence){x.status="active";x.consentEvidence=r.consentEvidence}else x.status="pending";contacts.push(x);render();return{ok:true,added:true,status:x.status}}};
contacts=loadStoredContacts();serial=Math.max(0,...contacts.map(x=>Number(x.id)||0));bootstrapPromotedRequests();render();renderRadar();void loadBackendContacts();setInterval(()=>{if(location.hash==="#mailing")void loadBackendContacts()},30000);
})();