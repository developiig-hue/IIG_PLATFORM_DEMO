(()=>{"use strict";
const KEY="iig.partner-program.v1";
const fallback={version:1,strategic:[
 {id:"strategic-1",name:"Investment Industrial Group s.r.o.",logo:"assets/partners/iig-group.png",url:"about.html",active:true},
 {id:"strategic-2",name:"",logo:"",url:"",active:false}
],partners:Array.from({length:8},(_,i)=>({id:"partner-"+(i+1),name:"",logo:"",url:"",active:false}))};
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(x&&Array.isArray(x.strategic)&&Array.isArray(x.partners))return x}catch(e){}return fallback}
function safeHref(v){v=String(v||"").trim();if(!v)return"#";if(/^https?:\/\//i.test(v)||/^(?:\.\/|\.\.\/|\/|[a-z0-9_-]+\.html(?:[?#].*)?|[a-z0-9_-]+\/)/i.test(v))return v;return"#"}
function card(x,cls){if(!x||!x.active||!x.logo)return"";const href=safeHref(x.url),external=/^https?:\/\//i.test(href);return '<a class="partner-logo '+cls+'" href="'+href.replace(/"/g,"&quot;")+'" '+(external?'target="_blank" rel="noopener noreferrer"':'')+' aria-label="'+String(x.name||"Partner").replace(/"/g,"&quot;")+'"><img src="'+String(x.logo).replace(/"/g,"&quot;")+'" alt="'+String(x.name||"Partner").replace(/"/g,"&quot;")+'"></a>'}
function render(){const root=document.getElementById("partnerProgram");if(!root)return;const d=load(),strategic=(d.strategic||[]).slice(0,2).filter(x=>x&&x.active&&x.logo),regular=(d.partners||[]).slice(0,8).filter(x=>x&&x.active&&x.logo),s=strategic.map(x=>card(x,"strategic")).join(""),p=regular.map(x=>card(x,"regular")).join(""),strategicClass="strategic-partners"+(strategic.length===1?" single":"");root.innerHTML='<div class="partners-heading" data-ua="ПАРТНЕРИ" data-en="PARTNERS">ПАРТНЕРИ</div><div class="partners-sub" data-ua="СТРАТЕГІЧНИЙ ПАРТНЕР" data-en="STRATEGIC PARTNER">СТРАТЕГІЧНИЙ ПАРТНЕР</div><div class="'+strategicClass+'">'+(s||'<div class="partner-empty">—</div>')+'</div>'+(p?'<div class="partners-sub regular-title" data-ua="ПАРТНЕРИ" data-en="PARTNERS">ПАРТНЕРИ</div><div class="regular-partners">'+p+'</div>':'');if(window.IIGApplyLanguage)window.IIGApplyLanguage()}
document.addEventListener("DOMContentLoaded",render);window.addEventListener("storage",e=>{if(e.key===KEY)render()});
})();