import { createClient } from "@supabase/supabase-js";

// ============================================================================
// Supabase Storage — File Upload Service for LineX-Forsa
// ============================================================================

let _supabase: ReturnType<typeof createClient> | null = null;

function getStorage() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isServer = typeof window === "undefined";
    const supabaseKey = isServer
      ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
      : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

    _supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return _supabase.storage;
}

const BUCKET = "uploads";

// ============================================================================
// Upload File
// ============================================================================
export async function uploadFile(
  file: File,
  folder: string = "general",
  userId?: string
): Promise<{ url: string; path: string; error?: string }> {
  try {
    if (typeof window === "undefined" && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        url: "",
        path: "",
        error: "SUPABASE_SERVICE_ROLE_KEY is missing on the server. Server-side uploads cannot bypass storage RLS without it.",
      };
    }

    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${folder}/${userId || "anon"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await getStorage()
      .from(BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("Upload error:", error);
      return { url: "", path: "", error: error.message };
    }

    // Get public URL
    const { data: urlData } = getStorage()
      .from(BUCKET)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, path: data.path };
  } catch (error: any) {
    console.error("Storage error:", error);
    return { url: "", path: "", error: error?.message || "Upload failed" };
  }
}

// ============================================================================
// Delete File
// ============================================================================
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const { error } = await getStorage().from(BUCKET).remove([path]);
    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// Get Signed URL (for private files)
// ============================================================================
export async function getSignedUrl(path: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const { data, error } = await getStorage()
      .from(BUCKET)
      .createSignedUrl(path, expiresIn);

    if (error) return null;
    return data.signedUrl;
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
): Promise<{ url: string; path: string; fileName: string; fileSize: number; mimeType: string; error?: string }> {
  const file = formData.get(fieldName) as File;

  if (!file || file.size === 0) {
    return { url: "", path: "", fileName: "", fileSize: 0, mimeType: "", error: "No file provided" };
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { url: "", path: "", fileName: "", fileSize: 0, mimeType: "", error: "File too large (max 10MB)" };
  }

  // Validate file type
  const allowedTypes = [
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "application/pdf",
    "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
  ];

  if (!allowedTypes.includes(file.type)) {
    return { url: "", path: "", fileName: "", fileSize: 0, mimeType: "", error: "File type not allowed" };
  }

  const result = await uploadFile(file, folder, userId);

  return {
    ...result,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}
