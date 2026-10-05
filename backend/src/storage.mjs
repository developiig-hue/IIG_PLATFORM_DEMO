import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const LOCAL_DIR=path.resolve(process.env.IIG_DIGEST_LOCAL_DIR||"./data/digest");
const mode=()=>String(process.env.IIG_DIGEST_STORAGE||"local").toLowerCase();

async function ensureLocal(){await fs.mkdir(LOCAL_DIR,{recursive:true})}
const metadataPath=()=>path.join(LOCAL_DIR,"current.json");
const pdfPath=()=>path.join(LOCAL_DIR,"current.pdf");

export function sha256(buf){return crypto.createHash("sha256").update(buf).digest("hex")}
export function revisionFor(buf){return sha256(buf).slice(0,16)}

async function localPut(pdf, meta){
  await ensureLocal();
  const tmpPdf=path.join(LOCAL_DIR,`.current.${process.pid}.${Date.now()}.pdf.tmp`);
  const tmpMeta=path.join(LOCAL_DIR,`.current.${process.pid}.${Date.now()}.json.tmp`);
  await fs.writeFile(tmpPdf,pdf,{flag:"wx"});
  await fs.writeFile(tmpMeta,JSON.stringify(meta,null,2),{flag:"wx"});
  await fs.rename(tmpPdf,pdfPath());
  await fs.rename(tmpMeta,metadataPath());
}
async function localGetMeta(){try{return JSON.parse(await fs.readFile(metadataPath(),"utf8"))}catch(e){if(e.code==="ENOENT")return null;throw e}}
async function localGetPdf(){try{return await fs.readFile(pdfPath())}catch(e){if(e.code==="ENOENT")return null;throw e}}

async function s3Client(){
  const {S3Client}=await import("@aws-sdk/client-s3");
  return new S3Client({
    region:process.env.IIG_S3_REGION||"auto",
    endpoint:process.env.IIG_S3_ENDPOINT||undefined,
    forcePathStyle:String(process.env.IIG_S3_FORCE_PATH_STYLE||"false")==="true",
    credentials:process.env.IIG_S3_ACCESS_KEY_ID?{
      accessKeyId:process.env.IIG_S3_ACCESS_KEY_ID,
      secretAccessKey:process.env.IIG_S3_SECRET_ACCESS_KEY||""
    }:undefined
  });
}
async function s3Put(pdf,meta){
  const {PutObjectCommand}=await import("@aws-sdk/client-s3");
  const client=await s3Client(), Bucket=process.env.IIG_S3_BUCKET;
  if(!Bucket) throw new Error("IIG_S3_BUCKET_REQUIRED");
  await client.send(new PutObjectCommand({Bucket,Key:"digest/current.pdf",Body:pdf,ContentType:"application/pdf",CacheControl:"public,max-age=0,must-revalidate"}));
  await client.send(new PutObjectCommand({Bucket,Key:"digest/current.json",Body:JSON.stringify(meta,null,2),ContentType:"application/json",CacheControl:"no-store"}));
}
async function s3Get(key){
  const {GetObjectCommand}=await import("@aws-sdk/client-s3");
  const client=await s3Client(), Bucket=process.env.IIG_S3_BUCKET;
  if(!Bucket) throw new Error("IIG_S3_BUCKET_REQUIRED");
  try{
    const r=await client.send(new GetObjectCommand({Bucket,Key:key}));
    const chunks=[]; for await (const c of r.Body) chunks.push(c);
    return Buffer.concat(chunks);
  }catch(e){if(e.name==="NoSuchKey"||e.$metadata?.httpStatusCode===404)return null;throw e}
}
async function s3GetMeta(){const b=await s3Get("digest/current.json");return b?JSON.parse(b.toString("utf8")):null}
async function s3GetPdf(){return s3Get("digest/current.pdf")}

export async function putCurrent(pdf,meta){return mode()==="s3"?s3Put(pdf,meta):localPut(pdf,meta)}
export async function getCurrentMeta(){return mode()==="s3"?s3GetMeta():localGetMeta()}
export async function getCurrentPdf(){return mode()==="s3"?s3GetPdf():localGetPdf()}
