import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";

// ============================================================================
// AWS S3 — File uploads (public reads via bucket policy or CloudFront base URL)
// ============================================================================

function getBucket(): string | null {
  return process.env.AWS_S3_BUCKET || null;
}

function getRegion(): string | null {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || null;
}

function getClient(): S3Client | null {
  const region = getRegion();
  if (!region) return null;
  // Explicit chain so Next.js server bundles still resolve EC2 instance-role creds
  // (default SDK chain can break when webpack bundles @aws-sdk).
  return new S3Client({
    region,
    credentials: defaultProvider(),
  });
}

function encodeKeyForUrl(key: string): string {
  return key.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

function publicObjectUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) return `${base}/${encodeKeyForUrl(key)}`;

  const bucket = getBucket();
  const region = getRegion();
  if (!bucket || !region) return "";
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeKeyForUrl(key)}`;
}

// ============================================================================
// Upload File
// ============================================================================
export async function uploadFile(
  file: File,
  folder: string = "general",
  userId?: string
): Promise<{ url: string; path: string; error?: string }> {
  try {
    if (typeof window !== "undefined") {
      return {
        url: "",
        path: "",
        error: "Uploads must run on the server (server action or API route).",
      };
    }

    const bucket = getBucket();
    const client = getClient();
    if (!bucket || !client) {
      return {
        url: "",
        path: "",
        error:
          "S3 is not configured (set AWS_REGION and AWS_S3_BUCKET). On EC2 you can use an instance IAM role instead of access keys.",
      };
    }

    const ext = file.name.split(".").pop() || "bin";
    const key = `${folder}/${userId || "anon"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const body = Buffer.from(await file.arrayBuffer());

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: file.type || "application/octet-stream",
        CacheControl: "max-age=3600",
      })
    );

    return { url: publicObjectUrl(key), path: key };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("S3 upload error:", error);
    return { url: "", path: "", error: message };
  }
}

// ============================================================================
// Delete File
// ============================================================================
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const bucket = getBucket();
    const client = getClient();
    if (!bucket || !client) return false;
    await client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: path })
    );
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Signed URL (private objects)
// ============================================================================
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const bucket = getBucket();
    const client = getClient();
    if (!bucket || !client) return null;

    const cmd = new GetObjectCommand({ Bucket: bucket, Key: path });
    return await awsGetSignedUrl(client, cmd, { expiresIn });
  } catch {
    return null;
  }
}

// ============================================================================
// Upload from Server Action (FormData)
// ============================================================================
export async function uploadFromFormData(
  formData: FormData,
  fieldName: string = "file",
  folder: string = "general",
  userId?: string
): Promise<{
  url: string;
  path: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  error?: string;
}> {
  const file = formData.get(fieldName) as File;

  if (!file || file.size === 0) {
    return {
      url: "",
      path: "",
      fileName: "",
      fileSize: 0,
      mimeType: "",
      error: "No file provided",
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      url: "",
      path: "",
      fileName: "",
      fileSize: 0,
      mimeType: "",
      error: "File too large (max 10MB)",
    };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      url: "",
      path: "",
      fileName: "",
      fileSize: 0,
      mimeType: "",
      error: "File type not allowed",
    };
  }

  const result = await uploadFile(file, folder, userId);

  return {
    ...result,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}
