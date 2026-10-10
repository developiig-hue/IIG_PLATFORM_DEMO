(()=>{"use strict";
const $=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const TEMPLATE_KEY="iig.demo.mail.templates.v36";
const DEFAULTS={
 UA:{subject:"IIG Monthly Digest — промислова енергетика | Вересень 2026",html:'<p><b>Шановний {{name}} !</b></p><p>Надсилаємо Вам новий випуск <b>IIG Monthly Digest — промислова енергетика | Вересень 2026</b>.</p><p>Це практичний огляд ключових подій, проєктів, технологій, фінансування та регуляторних змін у промисловій енергетиці за вересень 2026 року.</p><p>У випуску:</p><ul><li>генерація в промисловості України;</li><li>світова практика промислової енергетики;</li><li>фінансування та державне регулювання;</li><li>поради Головного інженера.</li></ul><p><b>Дайджест додається до листа у PDF.</b> Повні матеріали доступні за активними посиланнями всередині PDF на сайті IIG.</p><p><a href="https://developiig-hue.github.io/IIG_PLATFORM_DEMO/forms.html#project">РОЗМІСТИТИ ПРОЄКТ</a></p><p>З повагою,<br><b>Ігор Кривошей</b><br>Директор з розвитку IIG s.r.o.</p><p><a href="mailto:develop.iig@gmail.com?subject=UNSUBSCRIBE%20IIG%20Monthly%20Digest">ВІДПИСАТИСЯ ВІД РОЗСИЛКИ</a></p><p><i>Контрольна тестова розсилка. У production персональне HTTPS-посилання unsubscribe формується Recipient Provider і переводить адресу до suppression list.</i></p>'},
 EN:{subject:"IIG Monthly Digest — Industrial Energy Intelligence | [Month, Year]",html:'<p>{{greeting}}</p><p>Thank you for subscribing to <b>IIG Monthly Digest</b>. Please find the latest ADMIN_1-approved issue attached.</p><p>We hope the selected industrial energy, financing and engineering updates are useful for your work.</p><p>Best regards,<br><b>IIG — Industry Intelligence Generation</b></p>'}
};
let lastStatus=null,templates={};
async function api(url,opts={}){
 const r=await fetch(url,{credentials:"same-origin",cache:"no-store",...opts,headers:{...(opts.headers||{})}});
 let data=null;try{data=await r.json()}catch{data={}};
 if(!r.ok)throw Object.assign(new Error(data.error||("HTTP "+r.status)),{status:r.status,data});
 return data;
}
function localTemplates(){try{return JSON.parse(localStorage.getItem(TEMPLATE_KEY)||"{}")}catch{return{}}}
function saveLocalTemplates(){try{localStorage.setItem(TEMPLATE_KEY,JSON.stringify(templates))}catch{}}
function currentLang(){return $("mailTemplateLanguage")?.value||"UA"}
function setTemplateState(txt,kind="blue"){const x=$("mailTemplateState");if(!x)return;x.textContent=txt;x.classList.remove("green","red","amber","blue");x.classList.add(kind)}
function applyTemplate(t,lang=currentLang()){
 templates[lang]={...DEFAULTS[lang],...(t||{})};
 if($("campaignSubject"))$("campaignSubject").value=templates[lang].subject||DEFAULTS[lang].subject;
 if($("mailBodyRich"))$("mailBodyRich").innerHTML=templates[lang].html||DEFAULTS[lang].html;
 setTemplateState(templates[lang].updated_at?"ЗБЕРЕЖЕНО · "+(templates[lang].updated_by||"ADMIN"):"MASTER DEFAULT",templates[lang].updated_at?"green":"blue");
}
async function loadTemplate(lang=currentLang()){
 if(location.hostname.endsWith("github.io")){
   const saved=localTemplates()[lang];applyTemplate(saved||DEFAULTS[lang],lang);return;
 }
 try{applyTemplate(await api("/api/v1/mailing/template/"+lang),lang)}
 catch{applyTemplate(DEFAULTS[lang],lang)}
}
async function persistTemplate(){
 const lang=currentLang(),subject=$("campaignSubject")?.value.trim()||"",html=$("mailBodyRich")?.innerHTML||"";
 if(subject.length<3)return alert("Вкажіть тему листа.");
 if((($("mailBodyRich")?.innerText)||"").trim().length<10)return alert("Текст листа занадто короткий.");
 setTemplateState("ЗБЕРЕЖЕННЯ…","amber");
 if(location.hostname.endsWith("github.io")){
   templates[lang]={language:lang,subject,html,updated_by:"ADMIN_2",updated_at:new Date().toISOString()};
   saveLocalTemplates();applyTemplate(templates[lang],lang);return;
 }
 try{
   const x=await api("/api/v1/mailing/template/"+lang,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subject,html})});
   applyTemplate(x,lang);
 }catch(e){setTemplateState(e.data?.error||"ПОМИЛКА","red");alert("Не вдалося зберегти текст: "+(e.data?.error||e.message))}
}
async function resetTemplate(){
 const lang=currentLang();
 if(!confirm("Повернути раніше затверджений стандартний текст для "+lang+"?"))return;
 if(location.hostname.endsWith("github.io")){
   const all=localTemplates();delete all[lang];localStorage.setItem(TEMPLATE_KEY,JSON.stringify(all));templates=all;applyTemplate(DEFAULTS[lang],lang);return;
 }
 try{applyTemplate(await api("/api/v1/mailing/template/"+lang+"/reset",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),lang)}
 catch(e){alert("Не вдалося відновити MASTER: "+(e.data?.error||e.message))}
}
function exec(cmd,value=null){$("mailBodyRich")?.focus();document.execCommand(cmd,false,value)}
function transformSelection(mode){
 const sel=window.getSelection();if(!sel||sel.rangeCount===0||sel.isCollapsed)return;
 const text=sel.toString();let out=text;
 if(mode==="upper")out=text.toUpperCase();
 if(mode==="lower")out=text.toLowerCase();
 if(mode==="sentence")out=text.toLowerCase().replace(/(^|[.!?]\s+)([a-zа-яіїєґ])/giu,(m,a,b)=>a+b.toUpperCase());
 const range=sel.getRangeAt(0);range.deleteContents();range.insertNode(document.createTextNode(out));sel.removeAllRanges();
}
function addLink(){const url=prompt("URL посилання","https://");if(url&&/^https?:\/\//i.test(url))exec("createLink",url)}
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
  $("mailCheck").innerHTML="<b>PRODUCTION BACKEND НЕ ПІДКЛЮЧЕНО.</b><br>На GitHub Pages можна перевірити UA/EN редактор і MASTER-тексти локально. Реальна розсилка активується після підключення paid-hosting backend.";
  setState($("mailTransportState"),false,"PRODUCTION BACKEND REQUIRED");setState($("mailUnsubscribeState"),false,"PRODUCTION BACKEND REQUIRED");
 }
}
async function uploadDigest(){
 const file=$("mailDigestFile")?.files?.[0],lang=$("mailDigestLanguage")?.value||"UA";if(!file)return alert("Оберіть затверджений PDF Digest.");
 const fd=new FormData();fd.append("pdf",file,file.name);fd.append("language",lang);$("mailDigestState").textContent="ПЕРЕВІРКА PDF…";
 try{const x=await api("/api/v1/mailing/digest",{method:"POST",body:fd});$("mailDigestState").textContent="✓ ADMIN_1 APPROVED · "+(x.issue||"")+" · "+(x.revision||"");$("mailDigestState").classList.add("green");await refresh()}
 catch(e){$("mailDigestState").textContent=e.data?.error||e.message;$("mailDigestState").classList.add("red");alert(e.data?.error==="PDF_NOT_EQUAL_TO_ADMIN1_APPROVED_CURRENT"?"Цей PDF не збігається з exact-approved CURRENT Digest ADMIN_1. Розсилка заблокована.":"Не вдалося перевірити PDF: "+(e.data?.error||e.message))}
}
async function testSend(){
 const email=$("mailTestEmail")?.value.trim(),language=$("mailTestLanguage")?.value||"UA";if(!email)return alert("Вкажіть e-mail для тестового листа.");
 if(location.hostname.endsWith("github.io")){const message="Тестова відправка недоступна в GitHub Pages: сервер розсилки не підключено. Лист не відправлено.";if($("mailCheck"))$("mailCheck").textContent=message;alert(message);return;}
 try{const x=await api("/api/v1/mailing/test",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,language})});$("mailCheck").innerHTML="<b>✓ ТЕСТОВИЙ ЛИСТ ВІДПРАВЛЕНО</b><br>"+esc(x.to)+" · "+esc(x.language)+" · revision "+esc(x.revision)}
 catch(e){alert("Тестовий лист не відправлено: "+(e.data?.error||e.message))}
}
async function sendCampaign(){
 if(!confirm("Запустити реальну розсилку IIG Monthly Digest усім ACTIVE отримувачам? Дію може виконати тільки ADMIN_1."))return;
 $("massSendProd").disabled=true;
 try{const x=await api("/api/v1/mailing/send",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});$("mailCheck").innerHTML="<b>✓ РОЗСИЛКУ ЗАВЕРШЕНО</b><br>Campaign: "+esc(x.id)+"<br>Відправлено: "+esc(x.sent)+" / "+esc(x.total)+"<br>Помилки: "+esc(x.failed);await refresh()}
 catch(e){alert("Розсилку не запущено: "+(e.data?.error||e.message))}
 finally{$("massSendProd").disabled=false}
}
document.querySelectorAll("[data-mail-cmd]").forEach(b=>b.onclick=()=>exec(b.dataset.mailCmd));
document.querySelectorAll("[data-mail-case]").forEach(b=>b.onclick=()=>transformSelection(b.dataset.mailCase));
document.querySelectorAll("[data-mail-block]").forEach(b=>b.onclick=()=>exec("formatBlock",b.dataset.mailBlock));
$("mailAddLink")&&($("mailAddLink").onclick=addLink);
$("saveMailTemplate")&&($("saveMailTemplate").onclick=persistTemplate);
$("resetMailTemplate")&&($("resetMailTemplate").onclick=resetTemplate);
$("mailTemplateLanguage")&&($("mailTemplateLanguage").onchange=()=>loadTemplate(currentLang()));
$("uploadMailDigest")&&($("uploadMailDigest").onclick=uploadDigest);
$("mailDryRun")&&($("mailDryRun").onclick=refresh);
$("testSendProd")&&($("testSendProd").onclick=testSend);
$("massSendProd")&&($("massSendProd").onclick=sendCampaign);
$("mailDigestLanguage")&&($("mailDigestLanguage").onchange=refresh);
loadTemplate("UA");refresh();setInterval(()=>{if(location.hash==="#mailing")refresh()},30000);
})();