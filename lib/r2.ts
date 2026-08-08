import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName ||
    !publicUrl
  ) {
    throw new Error("Missing Cloudflare R2 configuration");
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

export function getR2Client() {
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getR2PublicUrl(key: string) {
  const { publicUrl } = getR2Config();
  return `${publicUrl.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

export function getUploadValidation(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP and GIF images are allowed");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size must be less than 5MB");
  }

  return true;
}

export function buildObjectKey(fileName: string, prefix = "images") {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  return `${prefix}/${Date.now()}-${randomUUID()}.${extension}`;
}

export async function uploadToR2(file: File, key: string) {
  const client = getR2Client();
  const { bucketName } = getR2Config();
  const buffer = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  return {
    url: getR2PublicUrl(key),
    key,
  };
}

export async function deleteFromR2(key: string) {
  const client = getR2Client();
  const { bucketName } = getR2Config();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}
