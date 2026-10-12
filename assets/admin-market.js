
(()=>{'use strict';
const $=id=>document.getElementById(id);
const KEY='iig.market.demo.v1',TERMS_KEY='iig.market.terms.demo.v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let role='ADMIN_2',selectedId=null,photoUrls=[];
const seed=[
 {listing_id:'IIG-MKT-0001',status:'READY_FOR_ADMIN_1',visibility:'HIDDEN',category:'Gas Engine / CHP',condition:'Б/У',title_ua:'Газопоршнева КГУ MAN 18V51/60G',title_en:'MAN 18V51/60G Gas Engine Generator Set',summary_ua:'Промислова КГУ для onsite generation / reserve CHP.',manufacturer:'MAN / Everllence',model:'18V51/60G',country:'Central Europe',availability:'Immediate',price_mode:'ON REQUEST',currency:'EUR',seller_price:3500000,public_price:3650000,fee:4,price_state:'ADMIN_2_PREPARED',seller:{company:'Confidential Seller A',name:'Private',email:'private@example.invalid',phone:'+000',id:'SELLER-001'},review:'DOCUMENTS RECEIVED',note:'Потребує перевірки remaining lifetime та scope dismantling.',fit:'Reserve CHP; Industrial onsite generation',include_digest:false,feature_digest:false,params:[['Electrical output','18','MW',true],['Voltage','10.5','kV',true],['Year','2018','',true],['Operating hours','18400','h',true],['Fuel','Natural gas','',true],['Frequency','50','Hz',true],['Heat recovery','Available','',true],['Control system','Included','',true]]},
 {listing_id:'IIG-MKT-0002',status:'DRAFT',visibility:'HIDDEN',category:'Transformers',condition:'NEW',title_ua:'Силовий трансформатор 40 MVA',title_en:'40 MVA Power Transformer',summary_ua:'Новий силовий трансформатор для промислової енергетичної інфраструктури.',manufacturer:'European OEM',model:'40 MVA',country:'EU',availability:'Q1 2027',price_mode:'ON REQUEST',currency:'EUR',seller_price:0,public_price:0,fee:0,price_state:'DRAFT',seller:{company:'Confidential Seller B',name:'',email:'',phone:'',id:'SELLER-002'},review:'NOT REVIEWED',note:'',fit:'Grid upgrade; Industrial substations',include_digest:false,feature_digest:false,params:[['Rated power','40','MVA',true],['Primary voltage','110','kV',true],['Secondary voltage','10.5','kV',true],['Year','2026','',true]]},
 {listing_id:'IIG-MKT-0003',status:'ADMIN_2_PREPARED',visibility:'HIDDEN',category:'BESS',condition:'NEW',title_ua:'BESS Container 20 MWh',title_en:'BESS Container 20 MWh',summary_ua:'Контейнерна система накопичення для peak shaving та grid support.',manufacturer:'Confidential OEM',model:'BESS 20MWh',country:'Europe',availability:'On request',price_mode:'PRICE RANGE',currency:'EUR',seller_price:0,public_price:0,fee:0,price_state:'ADMIN_2_PREPARED',seller:{company:'Confidential Seller C',name:'',email:'',phone:'',id:'SELLER-003'},review:'DOCUMENTS RECEIVED',note:'Потрібно підтвердити PCS та grid-code compliance.',fit:'BESS; Grid stability; Renewable integration',include_digest:true,feature_digest:false,params:[['Energy capacity','20','MWh',true],['PCS power','10','MW',true],['AC voltage','0.4-35','kV',true],['Year','2026','',true]]}
];
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(x)&&x.length?x:seed}catch(e){return seed}}
let items=load();
let terms=(()=>{try{return JSON.parse(localStorage.getItem(TERMS_KEY)||'null')||{version:'1.0',effective:'',summary:'IIG MARKET — контрольована B2B-платформа для спеціалізованого енергетичного обладнання.',steps:'',body:'',state:'DRAFT'}}catch(e){return{version:'1.0',effective:'',summary:'',steps:'',body:'',state:'DRAFT'}}})();
function persist(){localStorage.setItem(KEY,JSON.stringify(items));renderDigestQueue();renderDigestComposer()}
function persistTerms(){localStorage.setItem(TERMS_KEY,JSON.stringify(terms))}
const current=()=>items.find(x=>x.listing_id===selectedId);
function condClass(c){return c==='NEW'?'NEW':c==='Б/У'?'USED':c==='REFURBISHED'?'REFURBISHED':'NEVER'}
function statusPill(s){return ['PUBLISHED','SOLD'].includes(s)?'green':s==='READY_FOR_ADMIN_1'?'amber':'blue'}
function renderKpis(){
 $('marketKpiTotal').textContent=items.length;
 $('marketKpiDraft').textContent=items.filter(x=>x.status==='DRAFT').length;
 $('marketKpiWait').textContent=items.filter(x=>x.status==='READY_FOR_ADMIN_1').length;
 $('marketKpiPublished').textContent=items.filter(x=>x.status==='PUBLISHED').length;
 $('marketKpiSold').textContent=items.filter(x=>x.status==='SOLD').length;
 $('marketKpiTerms').textContent='v'+terms.version+' '+terms.state;
}
function filtered(){
 const q=($('marketSearch').value||'').toLowerCase(),s=$('marketStatusFilter').value,c=$('marketConditionFilter').value,k=$('marketCategoryFilter').value;
 return items.filter(x=>(!q||[x.listing_id,x.title_ua,x.manufacturer,x.model,x.category].join(' ').toLowerCase().includes(q))&&(s==='all'||x.status===s)&&(c==='all'||x.condition===c)&&(k==='all'||x.category===k));
}
function renderList(){
 const arr=filtered();$('marketListCount').textContent=arr.length+' позицій';
 $('marketList').innerHTML=arr.length?arr.map(x=>`<div class="market-list-item ${x.listing_id===selectedId?'selected':''}" data-id="${esc(x.listing_id)}"><div class="market-thumb">${x.photos&&x.photos[0]?'<img src="'+x.photos[0]+'" style="width:100%;height:100%;object-fit:cover">':'IIG'}</div><div class="market-list-main"><b>${x.urgent?'<span class="market-urgent-badge">ТЕРМІНОВО</span> ':''}${esc(x.title_ua||'Без назви')}</b><small>${esc(x.listing_id)} · ${esc(x.manufacturer||'—')} · ${esc(x.model||'—')}</small><small>${esc(x.category)} · ${esc(x.country||'—')}</small></div><div class="market-list-side"><span class="market-cond ${condClass(x.condition)}">${esc(x.condition)}</span><br><span class="pill ${statusPill(x.status)}">${esc(x.status)}</span></div></div>`).join(''):'<div class="empty">Немає позицій за фільтром.</div>';
 document.querySelectorAll('.market-list-item').forEach(el=>el.onclick=()=>select(el.dataset.id));
}
function setVal(id,v){if($(id))$(id).value=v??''}
function select(id){
 selectedId=id;const x=current();if(!x)return;
 $('marketEditorEmpty').classList.add('hidden');$('marketEditor').classList.remove('hidden');$('marketListingId').textContent=x.listing_id;$('marketEditorHint').textContent=x.status+' · '+x.condition;
 setVal('marketTitleUa',x.title_ua);setVal('marketTitleEn',x.title_en);setVal('marketSummaryUa',x.summary_ua);setVal('marketCategory',x.category);setVal('marketCondition',x.condition);setVal('marketManufacturer',x.manufacturer);setVal('marketModel',x.model);setVal('marketCountry',x.country);setVal('marketAvailability',x.availability);
 setVal('marketSellerCompany',x.seller?.company);setVal('marketSellerName',x.seller?.name);setVal('marketSellerEmail',x.seller?.email);setVal('marketSellerPhone',x.seller?.phone);setVal('marketSellerId',x.seller?.id);
 setVal('marketPriceMode',x.price_mode);setVal('marketCurrency',x.currency);setVal('marketSellerPrice',x.seller_price||'');setVal('marketPublicPrice',x.public_price||'');setVal('marketFee',x.fee||'');setVal('marketPriceState',x.price_state||'DRAFT');
 setVal('marketReviewStatus',x.review);setVal('marketTechnicalNote',x.note);setVal('marketProjectFit',x.fit);setVal('marketStatus',x.status);setVal('marketVisibility',x.visibility);
 if($('marketIncludeDigestTop'))$('marketIncludeDigestTop').checked=!!x.include_digest;if($('marketFeatureDigestTop'))$('marketFeatureDigestTop').checked=!!x.feature_digest;if($('marketUrgentTop'))$('marketUrgentTop').checked=!!x.urgent;
 renderParams(x);renderGallery(x);renderList();syncRoleButtons();
}
function renderParams(x){
 $('marketParamList').innerHTML=(x.params||[]).map((p,i)=>`<div class="market-param-row" data-i="${i}"><input class="input mp-name" value="${esc(p[0])}" placeholder="Параметр"><input class="input mp-val" value="${esc(p[1])}" placeholder="Значення"><input class="input mp-unit" value="${esc(p[2])}" placeholder="Од."><label class="market-param-public"><input class="mp-pub" type="checkbox" ${p[3]?'checked':''}> Public</label><button class="market-param-del" type="button">×</button></div>`).join('');
 document.querySelectorAll('.market-param-del').forEach((b,i)=>b.onclick=()=>{x.params.splice(i,1);renderParams(x)});
}
function collectParams(){return [...document.querySelectorAll('.market-param-row')].map(r=>[r.querySelector('.mp-name').value,r.querySelector('.mp-val').value,r.querySelector('.mp-unit').value,r.querySelector('.mp-pub').checked])}
function renderGallery(x){
 const arr=x.photos||[];$('marketGallery').innerHTML=arr.map((src,i)=>`<button type="button" data-i="${i}" class="${i===0?'active':''}"><img src="${src}"></button>`).join('');
 const cover=arr[0];$('marketCoverPreview').style.backgroundImage=cover?'url("'+cover+'")':'';$('marketCoverPreview').innerHTML=cover?'':'<span>Немає фото</span>';
}
function collect(){
 const x=current();if(!x)return null;
 const oldApproved=x.price_state==='ADMIN_1_APPROVED',oldPrice=Number(x.public_price||0),newPrice=Number($('marketPublicPrice').value||0);
 x.title_ua=$('marketTitleUa').value;x.title_en=$('marketTitleEn').value;x.summary_ua=$('marketSummaryUa').value;x.category=$('marketCategory').value;x.condition=$('marketCondition').value;x.manufacturer=$('marketManufacturer').value;x.model=$('marketModel').value;x.country=$('marketCountry').value;x.availability=$('marketAvailability').value;
 x.seller={company:$('marketSellerCompany').value,name:$('marketSellerName').value,email:$('marketSellerEmail').value,phone:$('marketSellerPhone').value,id:$('marketSellerId').value};
 x.price_mode=$('marketPriceMode').value;x.currency=$('marketCurrency').value;x.seller_price=Number($('marketSellerPrice').value||0);x.public_price=newPrice;x.fee=Number($('marketFee').value||0);
 if(oldApproved&&oldPrice!==newPrice)x.price_state='PRICE_REAPPROVAL_REQUIRED';
 x.review=$('marketReviewStatus').value;x.note=$('marketTechnicalNote').value;x.fit=$('marketProjectFit').value;x.status=$('marketStatus').value;x.visibility=$('marketVisibility').value;x.include_digest=!!($('marketIncludeDigestTop')&&$('marketIncludeDigestTop').checked);x.feature_digest=!!($('marketFeatureDigestTop')&&$('marketFeatureDigestTop').checked);x.urgent=!!($('marketUrgentTop')&&$('marketUrgentTop').checked);x.params=collectParams();x.updated_at=new Date().toISOString();x.updated_by=role;
 $('marketPriceState').value=x.price_state;
 return x;
}
function syncRoleButtons(){
 const is1=role==='ADMIN_1';$('marketApprovePrice').disabled=!is1;$('marketTermsApprove').disabled=!is1;
 $('marketApprovePrice').classList.toggle('lock',!is1);$('marketTermsApprove').classList.toggle('lock',!is1);
 $('marketPreparePrice').disabled=is1;$('marketTermsSave').disabled=is1;$('marketTermsSubmit').disabled=is1;
}
function marketCanonicalUrl(x){return 'market.html?id='+encodeURIComponent(x.listing_id)+'#listing-'+encodeURIComponent(x.listing_id)}
function digestEligibility(x){
 const reasons=[];
 if(!x.include_digest)return {ok:false,reasons:['NOT_SELECTED']};
 if(x.visibility==='HIDDEN')reasons.push('MARKET_HIDDEN');
 if(!['PUBLISHED','ADMIN_1_APPROVED'].includes(x.status))reasons.push('LISTING_NOT_PUBLIC');
 if(x.price_mode!=='ON REQUEST' && x.price_state!=='ADMIN_1_APPROVED')reasons.push('PRICE_NOT_ADMIN_1_APPROVED');
 return {ok:reasons.length===0,reasons};
}
function renderDigestQueue(){
 const host=$('marketDigestQueue'),count=$('marketDigestQueueCount');if(!host||!count)return;
 const arr=items.filter(x=>x.include_digest);
 count.textContent=arr.length+' позицій';
 host.innerHTML=arr.length?arr.map(x=>{const e=digestEligibility(x);const price=x.price_mode==='ON REQUEST'?'За запитом':(x.price_state==='ADMIN_1_APPROVED'?x.currency+' '+Number(x.public_price||0).toLocaleString('uk-UA'):'ЦІНА НЕ ЗАТВЕРДЖЕНА');const specs=(x.params||[]).filter(p=>p[3]).slice(0,4).map(p=>esc(p[0])+': '+esc(p[1]+' '+p[2])).join(' · ');return '<div class="market-digest-queue-item"><div><span class="market-cond '+condClass(x.condition)+'">'+esc(x.condition)+'</span> '+(x.urgent?'<span class="market-urgent-badge">ТЕРМІНОВО</span> ':'')+'<b>'+esc(x.title_ua)+'</b><small>'+esc(x.listing_id)+' · '+esc(x.category)+' · '+esc(price)+'</small><small>'+specs+'</small><code>'+esc(marketCanonicalUrl(x))+'</code></div><div><span class="pill '+(e.ok?'green':'amber')+'">'+(e.ok?'READY FOR DIGEST':'QUEUE / BLOCKED')+'</span><small>'+esc(e.ok?'Deep-link ready':e.reasons.join(' · '))+'</small></div></div>'}).join(''):'<div class="empty">Поки немає обладнання, вибраного для Дайджесту.</div>';
}

function digestCandidatePublic(x){
 const e=digestEligibility(x),price=x.price_mode==='ON REQUEST'?'За запитом':(x.price_state==='ADMIN_1_APPROVED'?x.currency+' '+Number(x.public_price||0).toLocaleString('uk-UA'):'ЦІНА НЕ ЗАТВЕРДЖЕНА');
 return {listing_id:x.listing_id,title_ua:x.title_ua,title_en:x.title_en,category:x.category,condition:x.condition,manufacturer:x.manufacturer,model:x.model,summary_ua:x.summary_ua,params:(x.params||[]).filter(p=>p[3]).slice(0,8),price_mode:x.price_mode,price_display:price,price_state:x.price_state,public_price:x.public_price,currency:x.currency,urgent:!!x.urgent,feature_digest:!!x.feature_digest,url:marketCanonicalUrl(x),eligible:e.ok,block_reasons:e.reasons};
}
window.IIG_MARKET_GET_DIGEST_CANDIDATES=()=>items.filter(x=>x.include_digest).map(digestCandidatePublic);
function renderDigestComposer(){
 const host=$('marketDigestComposerList'),cat=$('marketDigestCategory');if(!host||!cat)return;
 const all=items.filter(x=>x.include_digest);
 const cats=[...new Set(all.map(x=>x.category).filter(Boolean))].sort();
 const keep=cat.value||'all';cat.innerHTML='<option value="all">Усі категорії</option>'+cats.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');if(cats.includes(keep))cat.value=keep;
 const arr=all.filter(x=>cat.value==='all'||x.category===cat.value);
 host.innerHTML=arr.length?arr.map(x=>{const e=digestEligibility(x);return '<label class="market-digest-composer-item"><input type="checkbox" class="market-digest-pick" value="'+esc(x.listing_id)+'" '+(e.ok?'':'disabled')+'><span>'+(x.urgent?'<b class="market-urgent-badge">ТЕРМІНОВО</b> ':'')+'<b>'+esc(x.title_ua)+'</b><small>'+esc(x.category)+' · '+esc(x.condition)+' · '+esc(x.listing_id)+'</small><small>'+(e.ok?'READY FOR MANUAL PAGE':'BLOCKED: '+esc(e.reasons.join(' · ')))+'</small></span></label>'}).join(''):'<div class="empty">Немає відмічених MARKET-позицій у цій категорії.</div>';
}
if($('marketDigestCategory'))$('marketDigestCategory').onchange=renderDigestComposer;
if($('marketDigestRefresh'))$('marketDigestRefresh').onclick=renderDigestComposer;
if($('marketDigestBuildPage'))$('marketDigestBuildPage').onclick=()=>{
 const ids=[...document.querySelectorAll('.market-digest-pick:checked')].map(x=>x.value);
 if(!ids.length)return toast('Оберіть хоча б одну MARKET-позицію.');
 const selected=items.filter(x=>ids.includes(x.listing_id)).map(digestCandidatePublic);
 if(selected.some(x=>!x.eligible))return toast('Є заблоковані MARKET-позиції. Усуньте причини перед додаванням.');
 const target=Number($('marketDigestTargetPage').value||4);
 if(typeof window.IIG_DIGEST_ADD_MARKET_PAGE!=='function')return toast('Digest Builder API ще не готовий. Оновіть сторінку.');
 const result=window.IIG_DIGEST_ADD_MARKET_PAGE(target,selected);
 if(result&&result.ok){toast('IIG MARKET сторінку '+target+' сформовано вручну');renderDigestComposer()}else toast((result&&result.error)||'Не вдалося сформувати MARKET-сторінку.');
};
function toast(m){if(window.adminToast)return window.adminToast(m);alert(m)}
$('marketRole').onchange=e=>{role=e.target.value;syncRoleButtons();toast('MARKET role: '+role)};
if($('marketIncludeDigestTop'))$('marketIncludeDigestTop').onchange=()=>{const x=current();if(!x)return;x.include_digest=$('marketIncludeDigestTop').checked;persist();renderDigestQueue();renderDigestComposer();toast(x.include_digest?'Додано до пулу кандидатів MARKET → DIGEST':'Видалено з пулу кандидатів MARKET → DIGEST')};
if($('marketFeatureDigestTop'))$('marketFeatureDigestTop').onchange=()=>{const x=current();if(!x)return;x.feature_digest=$('marketFeatureDigestTop').checked;persist();renderDigestQueue();renderDigestComposer()};
if($('marketUrgentTop'))$('marketUrgentTop').onchange=()=>{const x=current();if(!x)return;x.urgent=$('marketUrgentTop').checked;persist();renderList();renderDigestQueue();renderDigestComposer();toast(x.urgent?'Мітку ТЕРМІНОВО активовано':'Мітку ТЕРМІНОВО вимкнено')};

['marketSearch','marketStatusFilter','marketConditionFilter','marketCategoryFilter'].forEach(id=>$(id).addEventListener(id==='marketSearch'?'input':'change',renderList));
$('marketResetFilters').onclick=()=>{$('marketSearch').value='';$('marketStatusFilter').value='all';$('marketConditionFilter').value='all';$('marketCategoryFilter').value='all';renderList()};
$('marketNewItem').onclick=()=>{const n=items.reduce((m,x)=>Math.max(m,Number((x.listing_id.match(/\d+$/)||['0'])[0])),0)+1;const id='IIG-MKT-'+String(n).padStart(4,'0');items.unshift({listing_id:id,status:'DRAFT',visibility:'HIDDEN',category:'Gas Engine / CHP',condition:'NEW',title_ua:'Нове обладнання',title_en:'New equipment',summary_ua:'',manufacturer:'',model:'',country:'',availability:'',price_mode:'ON REQUEST',currency:'EUR',seller_price:0,public_price:0,fee:0,price_state:'DRAFT',seller:{},review:'NOT REVIEWED',note:'',fit:'',include_digest:false,feature_digest:false,urgent:false,params:[],photos:[]});persist();renderKpis();select(id)};
$('marketAddParam').onclick=()=>{const x=current();if(!x)return;x.params=x.params||[];x.params.push(['','','',true]);renderParams(x)};
$('marketPhotoFile').onchange=e=>{const x=current();if(!x)return;[...e.target.files].slice(0,10).forEach(f=>{if(!/^image\/(jpeg|png|webp)$/.test(f.type))return;const rd=new FileReader();rd.onload=()=>{x.photos=x.photos||[];x.photos.push(rd.result);renderGallery(x)};rd.readAsDataURL(f)})};
$('marketSaveDraft').onclick=()=>{const x=collect();if(!x)return;persist();renderKpis();renderList();toast('Картку '+x.listing_id+' збережено у DEMO')};
$('marketSubmitAdmin1').onclick=()=>{const x=collect();if(!x)return;if(role!=='ADMIN_2'){toast('Передача готується ADMIN_2');return}x.status='READY_FOR_ADMIN_1';x.submitted_admin1_at=new Date().toISOString();persist();renderKpis();select(x.listing_id);toast('Передано ADMIN_1')};
$('marketPreparePrice').onclick=()=>{const x=collect();if(!x||role!=='ADMIN_2')return;x.price_state='ADMIN_2_PREPARED';x.price_admin2_prepared_at=new Date().toISOString();persist();select(x.listing_id);toast('Ціну підготовлено ADMIN_2')};
$('marketApprovePrice').onclick=()=>{const x=collect();if(!x||role!=='ADMIN_1')return;x.price_state='ADMIN_1_APPROVED';x.price_admin1_approved_at=new Date().toISOString();x.price_admin1_approved_by='ADMIN_1';persist();select(x.listing_id);toast('Публічну ціну затверджено ADMIN_1')};
$('marketArchiveItem').onclick=()=>{const x=current();if(!x)return;x.status='ARCHIVED';x.visibility='HIDDEN';persist();renderKpis();select(x.listing_id)};
$('marketPreviewItem').onclick=()=>{const x=collect();if(!x)return;const specs=(x.params||[]).filter(p=>p[3]).slice(0,10).map(p=>'<div><b>'+esc(p[0])+'</b><br>'+esc(p[1]+' '+p[2])+'</div>').join('');const html='<div class="market-preview-card"><span class="market-cond '+condClass(x.condition)+'">'+esc(x.condition)+'</span> '+(x.urgent?'<span class="market-urgent-badge">ТЕРМІНОВО</span>':'')+'<h2>'+esc(x.title_ua)+'</h2><p>'+esc(x.summary_ua)+'</p><div class="market-preview-specs">'+specs+'</div><p><b>Ціна:</b> '+(x.price_state==='ADMIN_1_APPROVED'?(x.price_mode==='ON REQUEST'?'за запитом':esc(x.currency+' '+x.public_price)):'НЕ ОПУБЛІКОВАНА · ADMIN_1 approval required')+'</p><button class="btn primary">ДЕТАЛІ / ЗАПИТ</button></div>';if(window.showAdminModal)showAdminModal(html,'IIG MARKET · PREVIEW',false,true);else alert(x.title_ua)};
$('marketTermsBtn').onclick=()=>{$('marketTermsPanel').classList.remove('hidden');$('marketTermsPanel').scrollIntoView({behavior:'smooth',block:'start'});renderTerms()};
$('marketTermsClose').onclick=()=>$('marketTermsPanel').classList.add('hidden');
function renderTerms(){setVal('marketTermsVersion',terms.version);setVal('marketTermsEffective',terms.effective);setVal('marketTermsSummary',terms.summary);setVal('marketTermsSteps',terms.steps);setVal('marketTermsBody',terms.body);$('marketTermsState').textContent=terms.state;renderKpis();syncRoleButtons()}
function collectTerms(){terms.version=$('marketTermsVersion').value;terms.effective=$('marketTermsEffective').value;terms.summary=$('marketTermsSummary').value;terms.steps=$('marketTermsSteps').value;terms.body=$('marketTermsBody').value;terms.updated_at=new Date().toISOString();terms.updated_by=role}
$('marketTermsSave').onclick=()=>{if(role!=='ADMIN_2')return;collectTerms();terms.state='DRAFT';persistTerms();renderTerms();toast('Draft умов збережено')};
$('marketTermsSubmit').onclick=()=>{if(role!=='ADMIN_2')return;collectTerms();terms.state='ADMIN_2_READY';persistTerms();renderTerms();toast('Умови передано ADMIN_1')};
$('marketTermsApprove').onclick=()=>{if(role!=='ADMIN_1')return;collectTerms();terms.state='ACTIVE';terms.approved_at=new Date().toISOString();terms.approved_by='ADMIN_1';persistTerms();renderTerms();toast('ACTIVE Terms затверджено ADMIN_1')};
window.IIG_MARKET_DIGEST_SOURCE=()=>JSON.parse(JSON.stringify(items));
window.IIG_MARKET_DIGEST_REFRESH=()=>{renderDigestQueue();renderDigestComposer();};
renderKpis();renderList();renderTerms();renderDigestQueue();renderDigestComposer();syncRoleButtons();
})();
