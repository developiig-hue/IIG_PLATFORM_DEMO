import {getDocument} from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractHttpLinks(pdfBuffer){
  const task=getDocument({data:new Uint8Array(pdfBuffer),disableWorker:true});
  const doc=await task.promise;
  const urls=[];
  for(let i=1;i<=doc.numPages;i++){
    const page=await doc.getPage(i);
    const annotations=await page.getAnnotations();
    for(const a of annotations){
      const url=a?.url||a?.unsafeUrl||"";
      if(/^https?:\/\//i.test(url)) urls.push(url);
    }
  }
  await doc.destroy();
  return [...new Set(urls)];
}

export async function verifyPdfLinks(pdfBuffer,expected=[]){
  const urls=await extractHttpLinks(pdfBuffer);
  const normalized=new Set(urls.map(String));
  const expectedUrls=(expected||[]).filter(x=>/^https?:\/\//i.test(String(x)));
  const missing=expectedUrls.filter(x=>!normalized.has(String(x)));
  return {
    links_preserved: urls.length>0 && missing.length===0,
    link_count: urls.length,
    missing_links: missing,
    urls
  };
}
