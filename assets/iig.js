(()=>{const D=document,$=(s,r=D)=>r.querySelector(s),$$=(s,r=D)=>[...r.querySelectorAll(s)];
function normalizeHeader(){const h=$('.site-header,.approved-header'),nav=h&&$('.nav',h);if(!h||!nav)return;h.classList.add('approved-header');const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();const items=[['./','ГОЛОВНА','HOME','index'],['./#industries','ГАЛУЗІ','INDUSTRIES','industry'],['financing.html','ФІНАНСУВАННЯ','FINANCING','financing'],['advice.html','ПОРАДИ ГОЛОВНОГО ІНЖЕНЕРА','CHIEF ENGINEER ADVICE','advice'],['news.html','НОВИНИ ТА ІНСАЙТИ','NEWS & INSIGHTS','news'],['about.html','ПРО IIG','ABOUT IIG','about'],['about.html#contact','КОНТАКТИ','CONTACTS','contact']];nav.innerHTML=items.map(([href,ua,en,key])=>{const active=(key==='index'&&(path===''||path==='index.html'))||(key==='industry'&&path==='industry.html')||(key==='financing'&&(path==='financing.html'||path==='finance-news.html'))||(key==='advice'&&path==='advice.html')||(key==='news'&&path==='news.html')||(key==='about'&&path==='about.html'&&!location.hash);return `<a${active?' class="active"':''} href="${href}" data-ua="${ua}" data-en="${en}">${ua}</a>`}).join('');const tools=$('.tools',h);if(tools&&!$('.search-ico',tools)){const s=D.createElement('span');s.className='search-ico';s.textContent='⌕';tools.appendChild(s)}}normalizeHeader();
/* STEP 25 locked readability pass. This deliberately overrides legacy page-local tiny typography. */
const readability=D.createElement('style');readability.id='step25-readability-lock';readability.textContent=`
@media(min-width:1181px){
.site-header .headrow,.approved-header .headrow{min-height:86px!important;gap:18px!important}
.site-header .brand,.approved-header .brand{min-width:305px!important;width:305px!important;height:72px!important;background-image:url('assets/iig-logo-navy.svg')!important}
.site-header .nav,.approved-header .nav{gap:18px!important}
.site-header .nav a,.approved-header .nav a{font-size:16px!important;line-height:1.15!important;font-weight:900!important;letter-spacing:-.15px!important;color:#061d42!important}
.site-header .nav a.active,.approved-header .nav a.active{color:#d99f00!important;padding-bottom:20px!important}
.site-header .lang button,.approved-header .lang button{font-size:16px!important;font-weight:900!important;padding:8px!important}
.search-ico{font-size:29px!important}
.compact .section-head h2,.section-head h2{font-size:20px!important;line-height:1.15!important}
.more-link,.section-link{font-size:14px!important}
.news-card h3{font-size:16px!important;line-height:1.3!important;min-height:0!important}
.news-card .meta,.meta{font-size:12px!important}
.home-industry b{font-size:12px!important;line-height:1.2!important}.home-industry small{font-size:11px!important}
.engineer-title h2{font-size:22px!important}.engineer-title .sub{font-size:14px!important}.engineer-title .btn{font-size:13px!important}
.latest-title{font-size:16px!important}.advice-mini small{font-size:11px!important}.advice-mini b{font-size:14px!important;line-height:1.3!important}
.side-cta strong{font-size:18px!important}.side-cta small{font-size:12px!important}
.value b{font-size:13px!important}.value small{font-size:11px!important}
}
@media(min-width:1181px) and (max-width:1550px){.site-header .brand,.approved-header .brand{min-width:255px!important;width:255px!important}.site-header .nav,.approved-header .nav{gap:12px!important}.site-header .nav a,.approved-header .nav a{font-size:14px!important}}
`;D.head.appendChild(readability);
function setLang(l,save=true){l=l==='en'?'en':'ua';D.documentElement.lang=l==='en'?'en':'uk';$$('[data-ua]').forEach(el=>{el.textContent=l==='en'?(el.dataset.en||el.dataset.ua):el.dataset.ua});$$('[data-ua-html]').forEach(el=>{el.innerHTML=l==='en'?(el.dataset.enHtml||el.dataset.uaHtml):el.dataset.uaHtml});$$('[data-ua-placeholder]').forEach(el=>{el.placeholder=l==='en'?(el.dataset.enPlaceholder||el.dataset.uaPlaceholder):el.dataset.uaPlaceholder});$$('[data-lang]').forEach(b=>b.classList.toggle('on',b.dataset.lang===l));if(save)sessionStorage.setItem('iig_lang_current',l)}setLang('ua',false);$$('[data-lang]').forEach(b=>b.onclick=()=>setLang(b.dataset.lang));const burger=$('.burger'),nav=$('.nav');if(burger&&nav)burger.onclick=()=>nav.classList.toggle('open');
const FIN=[
['nrb','NRB','https://uif.eu/assets/logos/NRB.png'],
['ebrd','EBRD','https://s3-us-gov-west-1.amazonaws.com/cg-654ebf73-8576-4082-ba73-dd1f1a7fe8dc/uploads/european-bank-for-reconstruction-and-development.png'],
['eifo','EIFO','https://www.danishpigacademy.com/fileadmin/ALL_LOGOS/EIFO.jpg?fileVersion=1745397392'],
['bpifrance','bpifrance','https://api.cloudly.space/resize/clip/1200/760/75/aHR0cDovL21lZGlhcy50b3VyaXNtLXN5c3RlbS5jb20vMy80LzM0OTUwM19kaWFwb3NpdGl2ZTEuanBn/image.jpg'],
['eib','EIB','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/European_Investment_Bank_logo.svg/960px-European_Investment_Bank_logo.svg.png'],
['worldbank','WORLD BANK','https://logos-world.net/wp-content/uploads/2023/02/World-Bank-Logo.jpg'],
['bii','BII','https://furtherafrica.com/content-files/uploads/2023/03/british_international_investment-logo.jpg']];
function financeLogos(){const cards=$$('.finance-card');cards.slice(0,7).forEach((c,i)=>{const [id,name,src]=FIN[i];c.style.cursor='pointer';c.style.position='relative';c.innerHTML=`<img src="${src}" alt="${name}" style="display:block;max-width:92%;width:auto;height:45px;object-fit:contain;margin:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><b style="display:none">${name}</b>`;c.onclick=()=>location.href=`finance-news.html?institution=${id}`;c.setAttribute('role','link');c.setAttribute('tabindex','0');c.onkeydown=e=>{if(e.key==='Enter')c.click()}})}financeLogos();
const ENERGY_FALLBACK='https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=900&q=82';function setVisual(el,u,fallback){if(el.tagName==='IMG'){el.src=u;el.onerror=()=>{el.onerror=null;el.src=fallback}}else{el.style.backgroundImage=`url("${u}")`;const probe=new Image();probe.onerror=()=>{el.style.backgroundImage=`url("${fallback}")`};probe.src=u}}$$('.news-card .thumb,[data-news-image]').forEach(el=>{const src=(el.dataset.sourceImage||'').trim();setVisual(el,src||ENERGY_FALLBACK,(el.dataset.fallbackImage||ENERGY_FALLBACK).trim())});})();