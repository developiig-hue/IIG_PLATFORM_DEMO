const clean=v=>String(v??"").replace(/[\u0000-\u001F\u007F]/g," ").replace(/\s+/g," ").trim();
const normGender=v=>{const x=clean(v).toUpperCase();return x==="F"||x==="FEMALE"||x==="Ж"?"F":x==="M"||x==="MALE"||x==="Ч"?"M":""};
const femalePatronymic=t=>/(івна|ївна|овна|евна|євна)$/iu.test(String(t||""));
function femaleNominative(fullName){
  let tokens=clean(fullName).replace(/[’]/g,"'").split(/\s+/).map(x=>x.replace(/^[,.;]+|[,.;]+$/g,"")).filter(Boolean);
  tokens=tokens.filter(x=>!["пані","пан"].includes(x.toLowerCase()));
  if(!tokens.length)return "";
  const patronymic=tokens.find(femalePatronymic)||"";
  let first=tokens[0];
  if(first.includes(",")&&tokens.length>1)first=tokens[1];
  return [first,patronymic].filter(Boolean).join(" ");
}
export function mailingGreeting(contact={},language="UA"){
  const lang=String(language||"UA").toUpperCase()==="EN"?"EN":"UA";
  const name=clean(contact.name);
  if(lang==="EN")return "Dear "+(name||"colleague")+"!";
  const explicit=clean(contact.appeal_ua);
  if(explicit)return explicit;
  const gender=normGender(contact.gender);
  if(gender==="F"){
    const female=femaleNominative(name);
    return female?"Шановна "+female+"!":"Вітаємо!";
  }
  if(gender==="M"&&name)return "Шановний "+name+"!";
  return "Вітаємо!";
}
