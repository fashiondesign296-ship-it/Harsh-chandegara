import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export const ALLOWED = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' } as const;
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

const s3 = () => new S3Client({
  region: process.env.S3_REGION || 'auto', endpoint: process.env.S3_ENDPOINT,
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
});

/** Magic-byte sniff so a renamed .exe can't pass as an image. */
function sniff(b: Buffer): keyof typeof ALLOWED | null {
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
  if (b.subarray(1, 4).toString() === 'PNG') return 'image/png';
  if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  if (b.subarray(4, 12).toString().includes('ftypavif')) return 'image/avif';
  return null;
}

export async function uploadImage(buf: Buffer) {
  if (buf.length > MAX_IMAGE_BYTES) throw new Error('Image is larger than 12 MB');
  const mime = sniff(buf);
  if (!mime) throw new Error('Only JPG, PNG, WebP or AVIF images are allowed');
  const key = `media/${new Date().getFullYear()}/${randomUUID()}.${ALLOWED[mime]}`;
  await s3().send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!, Key: key, Body: buf, ContentType: mime, CacheControl: 'public, max-age=31536000, immutable',
  }));
  return { key, mime, url: `https://${process.env.MEDIA_PUBLIC_HOST}/${key}`, sizeBytes: buf.length };
}
export const deleteObject = (key: string) =>
  s3().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
