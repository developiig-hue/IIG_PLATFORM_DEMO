(()=>{'use strict';
const D=document;
const $=(s,r=D)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lang=()=>{try{return localStorage.getItem('iig_lang_current')==='en'?'en':'ua'}catch(e){return'ua'}};
const text=v=>{if(v==null)return'';if(typeof v==='string')return v;if(Array.isArray(v))return v.map(text).join(' ');if(typeof v==='object')return Object.values(v).map(text).join(' ');return String(v)};
const norm=s=>String(s||'').toLocaleLowerCase('uk-UA').replace(/[’']/g,"'").replace(/[^a-zа-яіїєґ0-9%+./-]+/gi,' ').replace(/\s+/g,' ').trim()
 .replace(/\bєіб\b/g,'єіб eib').replace(/\beib\b/g,'eib єіб')
 .replace(/\bєбрр\b/g,'єбрр ebrd').replace(/\bebrd\b/g,'ebrd єбрр');
const stop=new Set(['і','и','й','та','and','or','the','a','an']);
const tokens=q=>norm(q).split(' ').filter(x=>x&&x.length>1&&!stop.has(x));

const STATIC=[
 {type:'finance',href:'financing.html',titleUa:'Фінансування',titleEn:'Financing',ua:'фінансування програми банки гарантії кредитування єіб eib єбрр ebrd eifo bpifrance world bank bii',en:'financing programs banks guarantees lending eib ebrd eifo bpifrance world bank bii'},
 {type:'finance',href:'finance-news.html?institution=eifo',titleUa:'EIFO · Export and Investment Fund of Denmark',titleEn:'EIFO · Export and Investment Fund of Denmark',ua:'eifo данія експортний інвестиційний фонд фінансування гарантії енергетика',en:'eifo denmark export investment fund financing guarantees energy'},
 {type:'finance',href:'finance-news.html?institution=ebrd',titleUa:'ЄБРР · EBRD',titleEn:'EBRD',ua:'єбрр ebrd європейський банк реконструкції та розвитку фінансування україна енергетика',en:'ebrd european bank for reconstruction and development financing ukraine energy'},
 {type:'finance',href:'finance-news.html?institution=eib',titleUa:'ЄІБ · EIB',titleEn:'EIB',ua:'єіб eib європейський інвестиційний банк фінансування енергетика інфраструктура',en:'eib european investment bank financing energy infrastructure'},
 {type:'finance',href:'finance-news.html?institution=bpifrance',titleUa:'Bpifrance',titleEn:'Bpifrance',ua:'bpifrance франція експортне фінансування гарантії',en:'bpifrance france export finance guarantees'},
 {type:'finance',href:'finance-news.html?institution=worldbank',titleUa:'World Bank Group',titleEn:'World Bank Group',ua:'world bank group світовий банк фінансування',en:'world bank group financing'},
 {type:'finance',href:'finance-news.html?institution=bii',titleUa:'British International Investment · BII',titleEn:'British International Investment · BII',ua:'bii british international investment британські інвестиції фінансування',en:'bii british international investment financing'},
 {type:'sector',href:'industry.html?sector=energy',titleUa:'Енергетика та енергетична інфраструктура',titleEn:'Energy & Energy Infrastructure',ua:'енергетика енергетична інфраструктура генерація мережі bess chp',en:'power energy infrastructure generation grids bess chp'},
 {type:'sector',href:'industry.html?sector=metallurgy',titleUa:'Металургія та важка промисловість',titleEn:'Metallurgy & Heavy Industry',ua:'металургія важка промисловість машинобудування',en:'metallurgy heavy industry manufacturing engineering'},
 {type:'sector',href:'industry.html?sector=food',titleUa:'Харчова промисловість',titleEn:'Food & Beverage',ua:'харчова промисловість напої харчове виробництво',en:'food beverage industry production'},
 {type:'sector',href:'industry.html?sector=logistics',titleUa:'Логістика та distribution centers',titleEn:'Logistics & Distribution Centers',ua:'логістика розподільчі центри склади',en:'logistics distribution centers warehouses'},
 {type:'sector',href:'industry.html?sector=datacenters',titleUa:'Дата-центри',titleEn:'Data Centers',ua:'дата центри дата-центри сервери bess ups',en:'data centers servers bess ups'},
 {type:'sector',href:'industry.html?sector=chemical',titleUa:'Хімічна промисловість',titleEn:'Chemical Industry',ua:'хімічна промисловість хімія basf',en:'chemical industry chemistry basf'},
 {type:'sector',href:'industry.html?sector=agriculture',titleUa:'Агро та агропереробка',titleEn:'Agriculture & Agro-processing',ua:'сільське господарство агропереробка агро',en:'agriculture agro processing'},
 {type:'sector',href:'industry.html?sector=pharma',titleUa:'Фармацевтика',titleEn:'Pharmaceuticals',ua:'фармацевтична промисловість фармацевтика',en:'pharmaceutical industry pharma'},
 {type:'sector',href:'industry.html?sector=waste',titleUa:'Відходи та переробка',titleEn:'Waste Management & Recycling',ua:'управління відходами переробка waste to energy',en:'waste management recycling waste to energy'}
];

let cache=null;
async function load(){
 if(cache)return cache;
 const base=D.baseURI;
 const get=(p)=>fetch(new URL(p,base),{cache:'no-store'}).then(r=>r.ok?r.json():{items:[]}).catch(()=>({items:[]}));
 cache=Promise.all([get('content/public-news.json'),get('content/public-advice.json')]).then(([news,advice])=>{
   const n=(news.items||[]).filter(x=>['APPROVED','PUBLISHED'].includes(x.status)&&x.admin_approved===true).map(x=>({
     type:'news',href:'article.html?id='+encodeURIComponent(x.slug),
     titleUa:x.title?.ua||x.slug,titleEn:x.title?.en||x.title?.ua||x.slug,
     summaryUa:x.summary?.ua||'',summaryEn:x.summary?.en||x.summary?.ua||'',
     ua:text([x.title?.ua,x.summary?.ua,x.body?.ua,x.body,x.body_html,x.company_context,x.sector,x.digest_rubric,x.tags,x.source_name]),
     en:text([x.title?.en,x.summary?.en,x.body?.en,x.body,x.body_html,x.company_context,x.sector,x.digest_rubric,x.tags,x.source_name])
   }));
   const a=(advice.items||[]).filter(x=>['APPROVED','PUBLISHED'].includes(x.status)&&x.admin_approved===true).map(x=>({
     type:'advice',href:'advice-article.html?id='+encodeURIComponent(x.slug),
     titleUa:x.title?.ua||x.slug,titleEn:x.title?.en||x.title?.ua||x.slug,
     summaryUa:x.summary?.ua||'',summaryEn:x.summary?.en||x.summary?.ua||'',
     ua:text([x.title?.ua,x.summary?.ua,x.topic,x.sections]),en:text([x.title?.en,x.summary?.en,x.topic,x.sections])
   }));
   return [...n,...a,...STATIC];
 });
 return cache;
}
function box(){
 let el=$('#site-search-results');
 if(el)return el;
 const hero=$('.home-hero');
 if(!hero)return null;
 el=D.createElement('section');el.id='site-search-results';el.className='site-search-results';
 hero.insertAdjacentElement('afterend',el);
 return el;
}
function render(query,items){
 const el=box(); if(!el)return;
 const en=lang()==='en';
 const kind=x=>x.type==='news'?(en?'News':'Новина'):x.type==='advice'?(en?'Chief Engineer Advice':'Порада головного інженера'):x.type==='finance'?(en?'Financing':'Фінансування'):(en?'Section':'Розділ');
 el.hidden=false;
 el.innerHTML='<div class="search-results-inner"><div class="search-results-head"><b>'+(en?'SEARCH RESULTS':'РЕЗУЛЬТАТИ ПОШУКУ')+': '+items.length+'</b><button type="button" class="search-close" aria-label="Close">×</button></div><div class="search-results-grid">'+
 (items.length?items.map(x=>'<a class="search-result-card" href="'+x.href+'"><small>'+kind(x)+'</small><strong>'+esc(en?(x.titleEn||x.titleUa):(x.titleUa||x.titleEn))+'</strong>'+((en?x.summaryEn:x.summaryUa)?'<span>'+esc(en?x.summaryEn:x.summaryUa)+'</span>':'')+'</a>').join(''):'<p>'+(en?'No results. Try another keyword.':'Нічого не знайдено. Спробуйте інше ключове слово.')+'</p>')+
 '</div></div>';
 $('.search-close',el)?.addEventListener('click',()=>{el.hidden=true});
 el.scrollIntoView({behavior:'smooth',block:'start'});
}
async function run(){
 const bar=$('.home-hero .searchbar'); const input=bar&&$('input',bar); if(!input)return;
 const raw=input.value.trim(); const ts=tokens(raw); if(!ts.length)return;
 try{
  const data=await load();
  const q=norm(raw);
  const ranked=data.map(x=>{
    const hay=norm(text([x.ua,x.en,x.titleUa,x.titleEn,x.summaryUa,x.summaryEn]));
    const hit=ts.filter(t=>hay.includes(t));
    let score=hit.length*10;
    if(hit.length===ts.length)score+=30;
    if(hay.includes(q))score+=20;
    return {x,score,hit:hit.length};
  }).filter(r=>r.hit>0).sort((a,b)=>b.score-a.score||b.hit-a.hit).slice(0,30).map(r=>r.x);
  render(raw,ranked);
 }catch(err){
  console.error('IIG_SITE_SEARCH_ERROR',err);
  render(raw,[]);
 }
}
function init(){
 const bar=$('.home-hero .searchbar'); if(!bar)return;
 const btn=$('button',bar), input=$('input',bar);
 if(btn){
   btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();run()},true);
   btn.dataset.searchBound='v1';
 }
 if(input){
   input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();run()}},true);
 }
 window.IIGSiteSearch={run,load};
}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();