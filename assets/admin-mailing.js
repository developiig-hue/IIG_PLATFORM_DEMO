(()=>{"use strict";
const $=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let lastStatus=null;
async function api(url,opts={}){
 const r=await fetch(url,{credentials:"same-origin",cache:"no-store",...opts,headers:{...(opts.headers||{})}});
 let data=null;try{data=await r.json()}catch{data={}};
 if(!r.ok)throw Object.assign(new Error(data.error||("HTTP "+r.status)),{status:r.status,data});
 return data;
}
function campaignRows(xs){
 const body=$("mailCampaignRows");if(!body)return;
 body.innerHTML=(xs||[]).length?(xs||[]).slice(0,20).map(x=>"<tr><td><b>"+esc(x.id)+"</b></td><td>"+esc(x.status)+"</td><td>"+esc(x.sent||0)+" / "+esc(x.total||0)+"</td><td>"+esc(x.failed||0)+"</td><td>"+esc(x.completed_at||x.created_at||"—")+"</td></tr>").join(""):'<tr><td colspan="5">Кампаній ще немає.</td></tr>';
}
function setState(el,ok,txt){if(!el)return;el.textContent=txt;el.classList.toggle("green",!!ok);el.classList.toggle("red",!ok)}
async function refresh(){
 try{
  const s=await api("/api/v1/mailing/status");lastStatus=s;
  $("campaignRecipients").textContent=s.active||0;$("mailSuppressed").textContent=s.suppressed||0;
  setState($("mailTransportState"),s.smtp_configured&&s.from_configured,s.smtp_configured&&s.from_configured?"SMTP ГОТОВИЙ":"SMTP НЕ ПІДКЛЮЧЕНО");
  setState($("mailUnsubscribeState"),s.unsubscribe_configured,s.unsubscribe_configured?"ПРАЦЮЄ":"НЕ ПІДКЛЮЧЕНО");
  const lang=$("mailDigestLanguage")?.value||"UA",d=s.validated_digest?.[lang];
  setState($("mailDigestState"),!!d,d?("ПЕРЕВІРЕНО · "+(d.issue||"")+" · "+String(d.revision||"")):"PDF НЕ ПЕРЕВІРЕНО");
  campaignRows(s.campaigns||[]);
  $("mailCheck").innerHTML="<b>PRE-FLIGHT:</b><br>• ACTIVE: "+(s.active||0)+"<br>• SUPPRESSED: "+(s.suppressed||0)+"<br>• SMTP: "+(s.smtp_configured?"OK":"НЕ ПІДКЛЮЧЕНО")+"<br>• Unsubscribe: "+(s.unsubscribe_configured?"OK":"НЕ ПІДКЛЮЧЕНО")+"<br>• UA PDF: "+(s.validated_digest?.UA?"READY":"NO")+"<br>• EN PDF: "+(s.validated_digest?.EN?"READY":"NO");
 }catch(e){
  $("mailCheck").innerHTML="<b>PRODUCTION BACKEND НЕ ПІДКЛЮЧЕНО.</b><br>На GitHub Pages масова розсилка навмисно не виконується. Після переносу на paid hosting цей самий Admin працюватиме через server-side API.";
  setState($("mailTransportState"),false,"PRODUCTION BACKEND REQUIRED");
  setState($("mailUnsubscribeState"),false,"PRODUCTION BACKEND REQUIRED");
 }
}
async function uploadDigest(){
 const input=$("mailDigestFile"),file=input?.files?.[0],lang=$("mailDigestLanguage")?.value||"UA";
 if(!file)return alert("Оберіть затверджений PDF Digest.");
 const fd=new FormData();fd.append("pdf",file,file.name);fd.append("language",lang);
 $("mailDigestState").textContent="ПЕРЕВІРКА PDF…";
 try{
  const x=await api("/api/v1/mailing/digest",{method:"POST",body:fd});
  $("mailDigestState").textContent="✓ ADMIN_1 APPROVED · "+(x.issue||"")+" · "+(x.revision||"");
  $("mailDigestState").classList.add("green");await refresh();
 }catch(e){
  $("mailDigestState").textContent=e.data?.error||e.message;$("mailDigestState").classList.add("red");
  alert(e.data?.error==="PDF_NOT_EQUAL_TO_ADMIN1_APPROVED_CURRENT"?"Цей PDF не збігається з exact-approved CURRENT Digest ADMIN_1. Розсилка заблокована.":"Не вдалося перевірити PDF: "+(e.data?.error||e.message));
 }
}
async function testSend(){
 const email=$("mailTestEmail")?.value.trim(),language=$("mailTestLanguage")?.value||"UA";
 if(!email)return alert("Вкажіть e-mail для тестового листа.");
 try{
  const x=await api("/api/v1/mailing/test",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,language})});
  $("mailCheck").innerHTML="<b>✓ ТЕСТОВИЙ ЛИСТ ВІДПРАВЛЕНО</b><br>"+esc(x.to)+" · "+esc(x.language)+" · revision "+esc(x.revision);
 }catch(e){alert("Тестовий лист не відправлено: "+(e.data?.error||e.message))}
}
async function sendCampaign(){
 if(!confirm("Запустити реальну розсилку IIG Monthly Digest усім ACTIVE отримувачам? Дію може виконати тільки ADMIN_1."))return;
 $("massSendProd").disabled=true;
 try{
  const x=await api("/api/v1/mailing/send",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
  $("mailCheck").innerHTML="<b>✓ РОЗСИЛКУ ЗАВЕРШЕНО</b><br>Campaign: "+esc(x.id)+"<br>Відправлено: "+esc(x.sent)+" / "+esc(x.total)+"<br>Помилки: "+esc(x.failed);
  await refresh();
 }catch(e){alert("Розсилку не запущено: "+(e.data?.error||e.message))}
 finally{$("massSendProd").disabled=false}
}
$("uploadMailDigest")&&($("uploadMailDigest").onclick=uploadDigest);
$("mailDryRun")&&($("mailDryRun").onclick=refresh);
$("testSendProd")&&($("testSendProd").onclick=testSend);
$("massSendProd")&&($("massSendProd").onclick=sendCampaign);
$("mailDigestLanguage")&&($("mailDigestLanguage").onchange=refresh);
refresh();
setInterval(()=>{if(location.hash==="#mailing")refresh()},30000);
})();