(()=>{const spread=document.querySelector('.spread');if(!spread||document.querySelector('.digest-pdf-download'))return;const advice=document.querySelector('#s4')||document.querySelector('.news .card:last-child');if(!advice)return;
/* Visitor download CTA: exact requested whitespace inside Chief Engineer Advice. */
advice.style.position='relative';advice.style.paddingBottom='46px';const a=document.createElement('button');a.type='button';a.className='digest-pdf-download';a.setAttribute('aria-label','Скачати PDF файл дайджесту');a.innerHTML='<span>СКАЧАТИ PDF_FILE</span><b aria-hidden="true">↓</b>';Object.assign(a.style,{position:'absolute',right:'12px',bottom:'8px',zIndex:'30',display:'inline-flex',alignItems:'center',gap:'10px',padding:'8px 13px',background:'#fff',color:'#d71920',border:'3px solid #d71920',borderRadius:'8px',font:'900 13px Calibri,Carlito,Arial,sans-serif',cursor:'pointer',textDecoration:'none',whiteSpace:'nowrap',boxShadow:'0 3px 10px rgba(215,25,32,.22)'});Object.assign(a.querySelector('b').style,{fontSize:'27px',lineHeight:'16px',fontWeight:'900',color:'#d71920'});
/* Use a real IMG for print. Browser print settings may suppress CSS backgrounds, but not IMG elements. */
const cover=document.querySelector('.cover');if(cover&&!cover.querySelector('.digest-cover-print-image')){const img=document.createElement('img');img.className='digest-cover-print-image';img.src='https://media.industrialinfo.com/home/industrial-complex-002-2x-1.webp';img.alt='';Object.assign(img.style,{display:'none'});cover.prepend(img)}
const s=document.createElement('style');s.textContent=`
@media print{
 @page{size:A4 landscape;margin:0}
 html,body{margin:0!important;padding:0!important;background:#fff!important;width:auto!important;height:auto!important;overflow:visible!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
 .siteback,.digest-pdf-download{display:none!important}
 .spread-frame{width:297mm!important;height:198mm!important;margin:0!important;padding:0!important;overflow:hidden!important}
 .spread{width:1536px!important;height:1024px!important;margin:0!important;transform:scale(.7307)!important;transform-origin:top left!important;box-shadow:none!important;overflow:hidden!important;break-inside:avoid!important;page-break-inside:avoid!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
 .cover,.news,.card,.head,.kpis,.cta,.ico{ -webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
 .cover{position:relative!important;background:#06223d!important;isolation:isolate!important}
 .digest-cover-print-image{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;z-index:0!important}
 .cover:after{content:''!important;display:block!important;position:absolute!important;inset:0!important;background:rgba(3,28,51,.64)!important;z-index:1!important;pointer-events:none!important}
 .cover>*:not(.digest-cover-print-image){position:relative!important;z-index:2!important}
}
`;document.head.appendChild(s);
a.onclick=()=>{const openPrint=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));const img=cover&&cover.querySelector('.digest-cover-print-image');if(img&&!img.complete){img.addEventListener('load',openPrint,{once:true});img.addEventListener('error',openPrint,{once:true});setTimeout(openPrint,1800)}else openPrint()};
})();
