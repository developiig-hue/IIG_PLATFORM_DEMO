(()=>{const spread=document.querySelector('.spread');if(!spread||document.querySelector('.digest-pdf-download'))return;const advice=document.querySelector('#s4')||document.querySelector('.news .card:last-child');if(!advice)return;
/* Visitor download CTA: exact requested whitespace inside Chief Engineer Advice. */
advice.style.position='relative';advice.style.paddingBottom='42px';const a=document.createElement('button');a.type='button';a.className='digest-pdf-download';a.setAttribute('aria-label','Скачати PDF файл дайджесту');a.innerHTML='<span>СКАЧАТИ PDF_FILE</span><b aria-hidden="true">↓</b>';Object.assign(a.style,{position:'absolute',right:'12px',bottom:'8px',zIndex:'30',display:'inline-flex',alignItems:'center',gap:'9px',padding:'7px 11px',background:'#fff7f7',color:'#d71920',border:'2px solid #d71920',borderRadius:'7px',font:'900 12px Calibri,Carlito,Arial,sans-serif',cursor:'pointer',textDecoration:'none',whiteSpace:'nowrap',boxShadow:'0 2px 7px rgba(215,25,32,.16)'});Object.assign(a.querySelector('b').style,{fontSize:'23px',lineHeight:'15px',fontWeight:'900',color:'#d71920'});
/* Print/PDF fidelity: preserve the original 1536x1024 spread, colors and cover artwork. */
const cover=document.querySelector('.cover');if(cover&&!cover.querySelector('.digest-cover-print-image')){const img=document.createElement('img');img.className='digest-cover-print-image';img.src='https://media.industrialinfo.com/home/industrial-complex-002-2x-1.webp';img.alt='';img.crossOrigin='anonymous';Object.assign(img.style,{display:'none'});cover.prepend(img)}
const s=document.createElement('style');s.textContent=`
@media print{
 @page{size:16in 10.6667in;margin:0}
 html,body{width:1536px!important;height:1024px!important;margin:0!important;padding:0!important;background:#fff!important;overflow:hidden!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
 .siteback,.digest-pdf-download{display:none!important}
 .spread-frame{width:1536px!important;height:1024px!important;margin:0!important;padding:0!important}
 .spread{position:relative!important;width:1536px!important;height:1024px!important;margin:0!important;transform:none!important;box-shadow:none!important;overflow:hidden!important;break-inside:avoid!important;page-break-inside:avoid!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
 .cover,.news,.card,.head,.kpis,.cta,.ico{ -webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
 .cover{position:relative!important;background:#06223d!important;isolation:isolate!important}
 .digest-cover-print-image{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;z-index:-2!important}
 .cover:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,28,51,.95) 0%,rgba(4,36,65,.62) 34%,rgba(3,27,49,.94) 100%);z-index:-1!important}
}
`;document.head.appendChild(s);
a.onclick=()=>{document.documentElement.classList.add('digest-printing');requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()))};window.addEventListener('afterprint',()=>document.documentElement.classList.remove('digest-printing'));
})();
