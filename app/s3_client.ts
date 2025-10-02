import { PutObjectCommand, DeleteObjectCommand, S3Client, type PutObjectCommandOutput, type DeleteObjectCommandOutput } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: 'auto', // Cloudflare R2では'auto'を使用
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || 'https://your-account-id.r2.cloudflarestorage.com',
  forcePathStyle: false, // Cloudflare R2ではfalse
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const bucketName = process.env.BUCKET_NAME;

// 既存のuploadFile関数（後方互換性のため保持）
export function uploadFile(file: File) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: file.name,
    Body: file,
  });
  return s3.send(command);
}

// より柔軟なupload関数
export async function upload(
  key: string,
  body: File | Buffer | Uint8Array | string,
  contentType?: string
): Promise<PutObjectCommandOutput> {
  let processedBody: Buffer | Uint8Array | string;
  
  // Fileオブジェクトの場合はArrayBufferに変換
  if (body instanceof File) {
    const arrayBuffer = await body.arrayBuffer();
    processedBody = new Uint8Array(arrayBuffer);
  } else {
    processedBody = body;
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: processedBody,
    ContentType: contentType,
  });
  return s3.send(command);
}

// ファイル削除関数
export async function deleteFile(key: string): Promise<DeleteObjectCommandOutput> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return s3.send(command);
}

// 複数ファイル削除関数
export async function deleteFiles(keys: string[]): Promise<DeleteObjectCommandOutput[]> {
  const deletePromises = keys.map(key => deleteFile(key));
  return Promise.all(deletePromises);
}

// S3のURLを生成するヘルパー関数
export function getS3Url(key: string): string {
  const cdnSubdomain = process.env.VITE_CDN_SUBDOMAIN;
  return `https://${cdnSubdomain}.anishare.net/${key}`;
}

// 既存のS3 URLからキーを抽出するヘルパー関数
export function extractKeyFromS3Url(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // 先頭の'/'を削除
  } catch (error) {
    console.error('Invalid URL:', url);
    return '';
  }
}

