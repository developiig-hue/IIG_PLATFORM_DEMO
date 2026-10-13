import fs from "node:fs/promises";
import path from "node:path";

const dir=path.resolve(process.env.IIG_EDITORIAL_DRAFT_DIR||"./var/editorial-drafts");
const safe=v=>String(v||"").toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,160);
const fileFor=slug=>path.join(dir,safe(slug)+".json");
async function writeRecord(slug,record){
  await fs.mkdir(dir,{recursive:true});const dst=fileFor(slug),tmp=dst+"."+process.pid+"."+Date.now()+".tmp";
  await fs.writeFile(tmp,JSON.stringify(record,null,2)+"\n",{mode:0o600});await fs.rename(tmp,dst);return record;
}
export async function getEditorial(slug){
  try{return JSON.parse(await fs.readFile(fileFor(slug),"utf8"))}catch(e){if(e.code==="ENOENT")return null;throw e}
}
export async function saveDraft(slug,item,role){
  const record={schema:"iig.editorial-record.v2",slug:safe(slug),status:"REVIEW",edited_by:role,edited_at:new Date().toISOString(),approved_by:null,approved_at:null,published_by:null,published_at:null,item:{...item,slug:safe(slug),status:"REVIEW",admin_approved:false,demo_published:false,editorial_edited_by:role}};
  return writeRecord(slug,record);
}
export async function approveEditorial(slug,role){
  if(role!=="ADMIN_1")throw Object.assign(new Error("ADMIN_1_REQUIRED"),{code:"ADMIN_1_REQUIRED"});
  const record=await getEditorial(slug);if(!record)throw Object.assign(new Error("EDITORIAL_NOT_FOUND"),{code:"EDITORIAL_NOT_FOUND"});
  if(record.item?.content_type==="NEWS"&&record.item?.image_admin_approved!==true)throw Object.assign(new Error("IMAGE_APPROVAL_REQUIRED"),{code:"IMAGE_APPROVAL_REQUIRED"});
  record.status="APPROVED";record.approved_by=role;record.approved_at=new Date().toISOString();
  record.item={...record.item,status:"APPROVED",admin_approved:true,demo_published:false};
  return writeRecord(slug,record);
}
export async function publishEditorial(slug,role){
  if(role!=="ADMIN_1")throw Object.assign(new Error("ADMIN_1_REQUIRED"),{code:"ADMIN_1_REQUIRED"});
  const record=await getEditorial(slug);if(!record)throw Object.assign(new Error("EDITORIAL_NOT_FOUND"),{code:"EDITORIAL_NOT_FOUND"});
  if(record.status!=="APPROVED"||record.approved_by!=="ADMIN_1")throw Object.assign(new Error("EDITORIAL_APPROVAL_REQUIRED"),{code:"EDITORIAL_APPROVAL_REQUIRED"});
  record.status="PUBLISHED";record.published_by=role;record.published_at=new Date().toISOString();
  record.item={...record.item,status:"PUBLISHED",admin_approved:true,demo_published:false,production_published:true,production_published_by:role,production_published_at:record.published_at};
  return writeRecord(slug,record);
}
