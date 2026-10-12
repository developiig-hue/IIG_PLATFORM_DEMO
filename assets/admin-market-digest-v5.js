(()=>{'use strict';
const MKEY='iig.market.demo.v1';
const MAX_PER_MARKET_PAGE=12;
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $id=id=>document.getElementById(id);

function readMarket(){
  try{if(typeof window.IIG_MARKET_DIGEST_SOURCE==='function'){const live=window.IIG_MARKET_DIGEST_SOURCE();if(Array.isArray(live))return live}const x=JSON.parse(localStorage.getItem(MKEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}
}
function canonicalUrl(x){return 'market.html?id='+encodeURIComponent(x.listing_id)+'#listing-'+encodeURIComponent(x.listing_id)}
function eligibility(x){
  const reasons=[];
  if(!x.include_digest)reasons.push('NOT_SELECTED');
  if(x.visibility==='HIDDEN')reasons.push('MARKET_HIDDEN');
  if(!['PUBLISHED','ADMIN_1_APPROVED'].includes(x.status))reasons.push('LISTING_NOT_PUBLIC');
  if(x.price_mode!=='ON REQUEST'&&x.price_state!=='ADMIN_1_APPROVED')reasons.push('PRICE_NOT_ADMIN_1_APPROVED');
  if(x.status==='SOLD'||x.status==='ARCHIVED')reasons.push('LISTING_INACTIVE');
  return {ok:reasons.length===0,reasons};
}
function powerOf(x){
  const arr=(x.params||[]).filter(p=>p&&p[3]!==false);
  const pref=arr.find(p=>/(electrical output|rated power|pcs power|power|capacity|output)/i.test(p[0]||''))||arr[0];
  if(!pref)return '';
  return [pref[1],pref[2]].filter(Boolean).join(' ').trim();
}
function categoryMeta(x){
  const c=String(x.category||'Other').toLowerCase();
  if(c.includes('gas engine')||c.includes('chp'))return {key:'KGU',tag:'KGU',label:'КОГЕНЕРАЦІЙНІ ГАЗОВІ УСТАНОВКИ / КГУ',order:10};
  if(c.includes('boiler'))return {key:'GAS_BOILER',tag:'GAS BOILER',label:'ГАЗОВА КОТЕЛЬНЯ (GAS BOILER)',order:20};
  if(c.includes('turbine'))return {key:'TURBIN',tag:'TURBIN',label:'ГАЗОВА ТУРБІНА (TURBIN)',order:30};
  if(c.includes('bess')||c.includes('battery'))return {key:'BESS',tag:'BESS',label:'BESS',order:40};
  if(c.includes('transform'))return {key:'TRANSFORMER',tag:'TRANSFORMER',label:'СИЛОВІ ТРАНСФОРМАТОРИ',order:50};
  return {key:'OTHER_'+String(x.category||'OTHER').toUpperCase(),tag:String(x.category||'OTHER').toUpperCase(),label:String(x.category||'ІНШЕ').toUpperCase(),order:90};
}
function shortName(x){
  const p=powerOf(x);
  const base=[x.manufacturer,x.model].filter(Boolean).join(' · ')||x.title_ua||x.title_en||x.listing_id;
  return p?base+' · '+p:base;
}
function priceDisplay(x){
  if(x.price_mode==='ON REQUEST')return 'За запитом';
  if(x.price_state==='ADMIN_1_APPROVED'&&Number(x.public_price||0)>0)return (x.currency||'EUR')+' '+Number(x.public_price||0).toLocaleString('uk-UA');
  return 'Ціна за запитом';
}
function toDigestItem(x){
  const e=eligibility(x),m=categoryMeta(x);
  return {
    listing_id:x.listing_id,category:x.category,category_key:m.key,category_tag:m.tag,category_label:m.label,category_order:m.order,
    condition:x.condition||'',urgent:!!x.urgent,title_ua:x.title_ua||'',title_en:x.title_en||'',manufacturer:x.manufacturer||'',model:x.model||'',
    power_display:powerOf(x),short_name:shortName(x),summary_ua:x.summary_ua||'',
    params:(x.params||[]).filter(p=>p&&p[3]!==false).slice(0,5),
    price_mode:x.price_mode||'ON REQUEST',price_state:x.price_state||'',price_display:priceDisplay(x),
    url:canonicalUrl(x),eligible:e.ok,eligibility_reasons:e.reasons
  };
}
function selectedMarketItems(){return readMarket().filter(x=>x.include_digest).map(toDigestItem)}
function eligibleMarketItems(){return selectedMarketItems().filter(x=>x.eligible)}
function groupedMarkup(arr){
  const groups=new Map();
  arr.forEach(x=>{
    const key=x.category_key||categoryMeta(x).key;
    if(!groups.has(key))groups.set(key,{meta:{key,tag:x.category_tag||categoryMeta(x).tag,label:x.category_label||categoryMeta(x).label,order:x.category_order||categoryMeta(x).order},items:[]});
    groups.get(key).items.push(x);
  });
  return [...groups.values()].sort((a,b)=>a.meta.order-b.meta.order).map(g=>
    '<section class="marketdigestgroup">'+
      '<div class="marketdigestgrouphead"><span class="marketdigesttypetag">'+h(g.meta.tag)+'</span><b>'+h(g.meta.label)+'</b></div>'+
      '<div class="marketdigestrows">'+g.items.map(x=>
        '<a class="marketdigestrow '+(x.urgent?'is-urgent':'')+'" href="'+h(x.url)+'">'+
          '<span class="marketdigestrowmain">'+(x.urgent?'<span class="marketdigesturgent">ТЕРМІНОВО</span>':'')+
          '<strong>'+h(x.short_name||shortName(x))+'</strong></span>'+
          '<span class="marketdigestrowmeta">'+h(x.condition||'')+(x.price_display?' · '+h(x.price_display):'')+'</span>'+
          '<span class="marketdigestread">читати далі… →</span>'+
        '</a>'
      ).join('')+'</div>'+
    '</section>'
  ).join('');
}
try{
  marketDigestPageMarkup=function(p){
    const d=p.design||{},arr=d.marketItems||[];
    return '<div class="marketdigestpage marketdigestpage-v5">'+
      '<div class="marketdigesthead"><span>IIG MARKET</span><h2>'+h(d.title||'ОБЛАДНАННЯ ТА ЕНЕРГЕТИЧНІ АКТИВИ')+'</h2>'+
      (d.subtitle?'<p>'+h(d.subtitle)+'</p>':'')+
      (d.editorialBody?'<div class="marketdigesteditorial">'+h(d.editorialBody)+'</div>':'')+
      '</div>'+
      (arr.length?groupedMarkup(arr):'<div class="empty">Немає обладнання у цій MARKET-сторінці.</div>')+
      '<div class="marketdigestfoot">Контакти продавця розкриваються лише після офіційного запиту через IIG.</div>'+
    '</div>';
  };
  printableMarketDigestPageMarkup=marketDigestPageMarkup;
}catch(e){console.warn('[IIG MARKET V5] markup override skipped',e)}

function marketPageDesign(items,title,subtitle,body){
  return {type:'MARKETPLACE',title:title||'IIG MARKET',subtitle:subtitle||'Обладнання та енергетичні активи',editorialBody:body||'',marketItems:JSON.parse(JSON.stringify(items))};
}
function makeMarketPage(n,chunk,title,subtitle,body){
  return {name:'Сторінка '+n+' — Marketplace / IIG MARKET',kind:'market',capacity:0,items:[],design:marketPageDesign(chunk,title,subtitle,body)};
}
function syncImporterMode(){
  const sel=$id('articleMaterialType'); if(!sel)return;
  const market=sel.value==='MARKETPLACE';
  const file=$id('articleSourceFile'),status=$id('articleImportStatus');
  if(file)file.disabled=market;
  if(status&&market){
    const all=selectedMarketItems(),ok=all.filter(x=>x.eligible).length,blocked=all.length-ok;
    status.className='miniwarn '+(ok?'ok':'warn');
    status.textContent='Marketplace: позначено '+all.length+' · готово до Digest '+ok+' · заблоковано release-gates '+blocked+'. Файл не потрібен. Заголовок / анонс / текст — необов’язкові для ADMIN_2.';
  }
}
function buildMarketplacePages(previewOnly=false){
  const chosen=selectedMarketItems(),ok=chosen.filter(x=>x.eligible);
  if(!chosen.length)return gate('IIG MARKET: немає обладнання з відміткою «Розмістити дане обладнання у Дайджесті».');
  if(!ok.length){
    const reasons=[...new Set(chosen.flatMap(x=>x.eligibility_reasons||[]))].join(', ');
    return gate('IIG MARKET: позначені позиції є, але жодна не пройшла release-gates. Перевірте visibility / ADMIN_1 approval / price approval. '+reasons);
  }
  const title=($id('articleImportTitle')?.value||'').trim()||'IIG MARKET';
  const lead=($id('articleImportLead')?.value||'').trim()||'Обладнання та енергетичні активи';
  const body=($id('articleImportBody')?.value||'').trim();
  const chunks=[]; for(let i=0;i<ok.length;i+=MAX_PER_MARKET_PAGE)chunks.push(ok.slice(i,i+MAX_PER_MARKET_PAGE));
  if(previewOnly){
    const host=$id('modalText'),modal=$id('modal'),mtitle=$id('modalTitle');
    if(mtitle)mtitle.textContent='MARKETPLACE · ПОПЕРЕДНІЙ ПЕРЕГЛЯД';
    if(host)host.innerHTML='<div class="previewbox">'+chunks.map((x,i)=>marketDigestPageMarkup(makeMarketPage(4+i,x,title,lead,body))).join('')+'</div>';
    if(modal)modal.classList.add('show');
    return;
  }
  const existingMarket=digestPages.map((p,i)=>({p,i})).filter(x=>x.p.kind==='market');
  if(existingMarket.length&&!confirm('Marketplace-сторінки вже є у цьому випуску. Повторне автопідтягування замінить їх поточним approved-пулом IIG MARKET і може скинути ручний порядок. Продовжити?'))return;
  const targetStart=3;
  for(let ci=0;ci<chunks.length;ci++){
    const idx=targetStart+ci,p=digestPages[idx];
    if(p&&p.kind!=='market')return gate('Page '+(idx+1)+' уже зайнята матеріалом іншого типу. Marketplace не перезаписує її. Перемістіть/видаліть цю сторінку або використайте ручний fallback.');
  }
  while(digestPages.length>targetStart&&digestPages[digestPages.length-1].kind==='market')digestPages.pop();
  chunks.forEach((chunk,ci)=>{
    const idx=targetStart+ci,n=idx+1,p=makeMarketPage(n,chunk,title,lead,body);
    if(idx<digestPages.length)digestPages[idx]=p; else digestPages.push(p);
  });
  commitManualDigestEdit();renderDigest();
  auditEvent('Marketplace auto-pull у Digest','Page 4+','AUTO-PULL · '+ok.length+' позицій · '+chunks.length+' сторінок');
  const status=$id('articleImportStatus');
  if(status){status.className='miniwarn ok';status.textContent='Marketplace сформовано: '+ok.length+' позицій на '+chunks.length+' сторінках. ADMIN_2 може змінити порядок ↑/↓, перенести ⇄ або виключити × окремі позиції.'}
}
function convertExtraPageToMarketplace(){
  const idx=Number($id('extraPageIndex')?.value),p=digestPages[idx];
  if(!p)return;
  const ok=eligibleMarketItems();
  if(!ok.length)return gate('Marketplace: немає позначених позицій, що пройшли release-gates.');
  const title=($id('extraPageTitle')?.value||'').trim()||'IIG MARKET';
  const sub=($id('extraPageSubtitle')?.value||'').trim()||'Обладнання та енергетичні активи';
  const body=($id('extraPageBody')?.value||'').trim();
  digestPages[idx]=makeMarketPage(idx+1,ok.slice(0,MAX_PER_MARKET_PAGE),title,sub,body);
  commitManualDigestEdit();renderDigest();
  $id('extraPageEditor')?.classList.add('hidden');
  auditEvent('Page 4+ переведено у Marketplace','Page '+(idx+1),Math.min(ok.length,MAX_PER_MARKET_PAGE)+' позицій');
}
function injectAdminControls(){
  const pages=[...document.querySelectorAll('#digestPages .digestpage')];
  pages.forEach((pageEl,pi)=>{
    if(pageEl.dataset.kind!=='market')return;
    const p=digestPages[pi]; if(!p||p.kind!=='market')return;
    const body=pageEl.querySelector('.digestpagebody'); if(!body)return;
    let box=body.querySelector('.marketdigest-admin-controls');
    if(!box){box=document.createElement('div');box.className='marketdigest-admin-controls';body.prepend(box)}
    box.innerHTML='<div class="marketdigest-admin-title"><div><b>ADMIN_2 · ПОРЯДОК MARKETPLACE</b><small>Автозбірка — лише старт. ↑/↓ порядок · ⇄ інша MARKET-сторінка · × прибрати тільки з цього Digest.</small></div><button class="btn primary mktEditWrap" data-p="'+pi+'">✎ РЕДАГУВАТИ ПІДЛОЖКУ</button></div>'+
      (p.design?.marketItems||[]).map((x,i)=>'<div class="marketdigest-admin-row" data-p="'+pi+'" data-i="'+i+'"><span class="marketdigest-admin-tag">'+h(x.category_tag||categoryMeta(x).tag)+'</span><span class="marketdigest-admin-name">'+h(x.short_name||shortName(x))+'</span><span class="marketdigest-admin-actions"><button class="iconbtn mktUp">↑</button><button class="iconbtn mktDown">↓</button><button class="iconbtn mktMove">⇄</button><button class="iconbtn mktDel">×</button></span></div>').join('');
  });
}
function openMarketWrapperEditor(pi){
  const p=digestPages[pi],d=p?.design||{};if(!p||p.kind!=='market')return;
  $id('extraPageIndex').value=String(pi);$id('extraPageType').value='MARKETPLACE';
  $id('extraPageTitle').value=d.title||'IIG MARKET';$id('extraPageSubtitle').value=d.subtitle||'';
  $id('extraPageBody').value=d.editorialBody||'';
  document.querySelectorAll('.extraAnnouncement').forEach(x=>x.value='');
  $id('extraPageEditor').classList.remove('hidden');
  $id('extraPageEditor').scrollIntoView({behavior:'smooth',block:'start'});
}
function mutateMarketItem(button,action){
  const row=button.closest('.marketdigest-admin-row'),pi=Number(row.dataset.p),ii=Number(row.dataset.i),p=digestPages[pi],a=p?.design?.marketItems;
  if(!Array.isArray(a)||!a[ii])return;
  if(action==='up'&&ii>0)[a[ii-1],a[ii]]=[a[ii],a[ii-1]];
  if(action==='down'&&ii<a.length-1)[a[ii+1],a[ii]]=[a[ii],a[ii+1]];
  if(action==='del')a.splice(ii,1);
  if(action==='move'){
    const target=Number(prompt('Перемістити обладнання на MARKET-сторінку № (4+)',String(pi+2)))-1;
    if(!Number.isInteger(target)||target<3||target===pi)return;
    if(target>digestPages.length)return gate('Не можна залишати пропуск у нумерації Digest.');
    if(target===digestPages.length)digestPages.push(makeMarketPage(target+1,[],'IIG MARKET','Обладнання та енергетичні активи',''));
    const tp=digestPages[target];
    if(!tp||tp.kind!=='market')return gate('Page '+(target+1)+' не є Marketplace. ⇄ не перезаписує інший тип матеріалу.');
    tp.design.marketItems=tp.design.marketItems||[];
    tp.design.marketItems.push(a.splice(ii,1)[0]);
  }
  commitManualDigestEdit();renderDigest();
}
document.addEventListener('click',e=>{
  const edit=e.target.closest('.mktEditWrap');if(edit){openMarketWrapperEditor(Number(edit.dataset.p));return}
  const b=e.target.closest('.mktUp,.mktDown,.mktMove,.mktDel');if(!b)return;
  if(b.classList.contains('mktUp'))mutateMarketItem(b,'up');
  else if(b.classList.contains('mktDown'))mutateMarketItem(b,'down');
  else if(b.classList.contains('mktMove'))mutateMarketItem(b,'move');
  else mutateMarketItem(b,'del');
});
const observer=new MutationObserver(()=>injectAdminControls());
const digestHost=$id('digestPages'); if(digestHost)observer.observe(digestHost,{childList:true,subtree:true});

const mat=$id('articleMaterialType');
if(mat){
  if(![...mat.options].some(o=>o.value==='MARKETPLACE'))mat.add(new Option('Marketplace','MARKETPLACE'));
  mat.addEventListener('change',syncImporterMode);
}
const ext=$id('extraPageType');
if(ext&&!([...ext.options].some(o=>o.value==='MARKETPLACE')))ext.add(new Option('Marketplace','MARKETPLACE'));

const build=$id('buildArticlePages');
if(build){
  const old=build.onclick;
  build.onclick=(e)=>{if($id('articleMaterialType')?.value==='MARKETPLACE')return buildMarketplacePages(false);return old&&old.call(build,e)};
}
const prev=$id('previewArticleImport');
if(prev){
  const old=prev.onclick;
  prev.onclick=(e)=>{if($id('articleMaterialType')?.value==='MARKETPLACE')return buildMarketplacePages(true);return old&&old.call(prev,e)};
}
const saveExtra=$id('saveExtraPage');
if(saveExtra){
  const old=saveExtra.onclick;
  saveExtra.onclick=(e)=>{if($id('extraPageType')?.value==='MARKETPLACE')return convertExtraPageToMarketplace();return old&&old.call(saveExtra,e)};
}
syncImporterMode();
try{renderDigest()}catch(e){console.warn('[IIG MARKET V5] initial Digest rerender skipped',e)}
injectAdminControls();
window.IIG_MARKETPLACE_DIGEST_V5={readMarket,selectedMarketItems,eligibleMarketItems,buildMarketplacePages,categoryMeta,shortName};
})();