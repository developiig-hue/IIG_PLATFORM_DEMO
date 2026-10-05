import fs from "node:fs/promises";
import path from "node:path";

const dir=path.resolve(process.env.IIG_DIGEST_LOCAL_DIR||"./data/digest");
const file=path.join(dir,"approval.json");
const mode=()=>String(process.env.IIG_DIGEST_STORAGE||"local").toLowerCase();

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
async function s3Save(record){
  const {PutObjectCommand}=await import("@aws-sdk/client-s3");
  const Bucket=process.env.IIG_S3_BUCKET;if(!Bucket)throw new Error("IIG_S3_BUCKET_REQUIRED");
  const client=await s3Client();
  await client.send(new PutObjectCommand({Bucket,Key:"digest/approval.json",Body:JSON.stringify(record,null,2),ContentType:"application/json",CacheControl:"no-store"}));
}
async function s3Get(){
  const {GetObjectCommand}=await import("@aws-sdk/client-s3");
  const Bucket=process.env.IIG_S3_BUCKET;if(!Bucket)throw new Error("IIG_S3_BUCKET_REQUIRED");
  try{
    const r=await (await s3Client()).send(new GetObjectCommand({Bucket,Key:"digest/approval.json"}));
    const chunks=[];for await(const x of r.Body)chunks.push(x);
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  }catch(e){if(e.name==="NoSuchKey"||e.$metadata?.httpStatusCode===404)return null;throw e}
}
export async function saveApproval(record){
  if(mode()==="s3")return s3Save(record);
  await fs.mkdir(dir,{recursive:true});
  const tmp=path.join(dir,`.approval.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tmp,JSON.stringify(record,null,2),{flag:"wx"});
  await fs.rename(tmp,file);
}
export async function getApproval(){
  if(mode()==="s3")return s3Get();
  try{return JSON.parse(await fs.readFile(file,"utf8"))}
  catch(e){if(e.code==="ENOENT")return null;throw e}
}
