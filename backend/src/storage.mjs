import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const LOCAL_DIR=path.resolve(process.env.IIG_DIGEST_LOCAL_DIR||"./data/digest");
const mode=()=>String(process.env.IIG_DIGEST_STORAGE||"local").toLowerCase();
const langKey=language=>String(language||"UA").toUpperCase()==="EN"?"en":"ua";
const names=language=>langKey(language)==="en"?{pdf:"current-en.pdf",json:"current-en.json"}:{pdf:"current.pdf",json:"current.json"};

async function ensureLocal(){await fs.mkdir(LOCAL_DIR,{recursive:true})}
const metadataPath=language=>path.join(LOCAL_DIR,names(language).json);
const pdfPath=language=>path.join(LOCAL_DIR,names(language).pdf);

export function sha256(buf){return crypto.createHash("sha256").update(buf).digest("hex")}
export function revisionFor(buf){return sha256(buf).slice(0,16)}

async function localPut(pdf,meta){
  await ensureLocal();
  const n=names(meta.language),stamp=Date.now();
  const tmpPdf=path.join(LOCAL_DIR,`.${n.pdf}.${process.pid}.${stamp}.tmp`);
  const tmpMeta=path.join(LOCAL_DIR,`.${n.json}.${process.pid}.${stamp}.tmp`);
  await fs.writeFile(tmpPdf,pdf,{flag:"wx"});
  await fs.writeFile(tmpMeta,JSON.stringify(meta,null,2),{flag:"wx"});
  await fs.rename(tmpPdf,pdfPath(meta.language));
  await fs.rename(tmpMeta,metadataPath(meta.language));
}
async function localGetMeta(language){try{return JSON.parse(await fs.readFile(metadataPath(language),"utf8"))}catch(e){if(e.code==="ENOENT")return null;throw e}}
async function localGetPdf(language){try{return await fs.readFile(pdfPath(language))}catch(e){if(e.code==="ENOENT")return null;throw e}}

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
  const client=await s3Client(),Bucket=process.env.IIG_S3_BUCKET,n=names(meta.language);
  if(!Bucket)throw new Error("IIG_S3_BUCKET_REQUIRED");
  await client.send(new PutObjectCommand({Bucket,Key:"digest/"+n.pdf,Body:pdf,ContentType:"application/pdf",CacheControl:"public,max-age=0,must-revalidate"}));
  await client.send(new PutObjectCommand({Bucket,Key:"digest/"+n.json,Body:JSON.stringify(meta,null,2),ContentType:"application/json",CacheControl:"no-store"}));
}
async function s3Get(key){
  const {GetObjectCommand}=await import("@aws-sdk/client-s3");
  const client=await s3Client(),Bucket=process.env.IIG_S3_BUCKET;
  if(!Bucket)throw new Error("IIG_S3_BUCKET_REQUIRED");
  try{const r=await client.send(new GetObjectCommand({Bucket,Key:key}));const chunks=[];for await(const x of r.Body)chunks.push(x);return Buffer.concat(chunks)}
  catch(e){if(e.name==="NoSuchKey"||e.$metadata?.httpStatusCode===404)return null;throw e}
}
async function s3GetMeta(language){const b=await s3Get("digest/"+names(language).json);return b?JSON.parse(b.toString("utf8")):null}
async function s3GetPdf(language){return s3Get("digest/"+names(language).pdf)}

export async function putCurrent(pdf,meta){return mode()==="s3"?s3Put(pdf,meta):localPut(pdf,meta)}
export async function getCurrentMeta(language="UA"){return mode()==="s3"?s3GetMeta(language):localGetMeta(language)}
export async function getCurrentPdf(language="UA"){return mode()==="s3"?s3GetPdf(language):localGetPdf(language)}
