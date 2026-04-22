// ============================================================================
// File Upload Validation — Magic byte validation for secure file uploads
// ============================================================================

import { logger } from "./logger";

// ============================================================================
// File Magic Bytes (File Signatures)
// ============================================================================

interface FileSignature {
  mimeType: string;
  extensions: string[];
  magicBytes: number[][];
}

const FILE_SIGNATURES: FileSignature[] = [
  // Images
  {
    mimeType: "image/jpeg",
    extensions: [".jpg", ".jpeg"],
    magicBytes: [
      [0xFF, 0xD8, 0xFF], // JPEG
    ],
  },
  {
    mimeType: "image/png",
    extensions: [".png"],
    magicBytes: [
      [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
    ],
  },
  {
    mimeType: "image/gif",
    extensions: [".gif"],
    magicBytes: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
    ],
  },
  {
    mimeType: "image/webp",
    extensions: [".webp"],
    magicBytes: [
      [0x52, 0x49, 0x46, 0x46], // RIFF (WEBP container)
    ],
  },
  // Documents
  {
    mimeType: "application/pdf",
    extensions: [".pdf"],
    magicBytes: [
      [0x25, 0x50, 0x44, 0x46], // %PDF
    ],
  },
  {
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extensions: [".docx"],
    magicBytes: [
      [0x50, 0x4B, 0x03, 0x04], // ZIP (DOCX is a ZIP)
    ],
  },
  {
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extensions: [".xlsx"],
    magicBytes: [
      [0x50, 0x4B, 0x03, 0x04], // ZIP (XLSX is a ZIP)
    ],
  },
  {
    mimeType: "application/msword",
    extensions: [".doc"],
    magicBytes: [
      [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // OLE (DOC)
    ],
  },
  {
    mimeType: "application/vnd.ms-excel",
    extensions: [".xls"],
    magicBytes: [
      [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // OLE (XLS)
    ],
  },
  // Archives
  {
    mimeType: "application/zip",
    extensions: [".zip"],
    magicBytes: [
      [0x50, 0x4B, 0x03, 0x04], // ZIP
      [0x50, 0x4B, 0x05, 0x06], // Empty ZIP
    ],
  },
];

// ============================================================================
// Validation Functions
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  detectedType: string | null;
  error?: string;
}

/**
 * Validate file content by checking magic bytes
 */
export function validateFileContent(
  buffer: Buffer | Uint8Array,
  declaredMimeType: string
): ValidationResult {
  try {
    // Find matching signature for declared MIME type
    const expectedSignature = FILE_SIGNATURES.find(
      (sig) => sig.mimeType === declaredMimeType
    );

    if (!expectedSignature) {
      // MIME type not in our validation list, skip magic byte check
      return { valid: true, detectedType: declaredMimeType };
    }

    // Check if buffer matches any of the expected magic bytes
    for (const magicBytes of expectedSignature.magicBytes) {
      if (matchesMagicBytes(buffer, magicBytes)) {
        return { valid: true, detectedType: expectedSignature.mimeType };
      }
    }

    // Magic bytes don't match - try to detect actual type
    const detectedType = detectFileType(buffer);
    
    logger.security("file_magic_bytes_mismatch", undefined, {
      declaredType: declaredMimeType,
      detectedType,
    });

    return {
      valid: false,
      detectedType,
      error: `File content doesn't match declared type. Expected ${declaredMimeType}, detected ${detectedType || "unknown"}`,
    };
  } catch (error) {
    logger.error("File validation error", {}, error as Error);
    return {
      valid: false,
      detectedType: null,
      error: "Failed to validate file content",
    };
  }
}

/**
 * Check if buffer starts with the given magic bytes
 */
function matchesMagicBytes(buffer: Buffer | Uint8Array, magicBytes: number[]): boolean {
  if (buffer.length < magicBytes.length) return false;

  for (let i = 0; i < magicBytes.length; i++) {
    if (buffer[i] !== magicBytes[i]) return false;
  }

  return true;
}

/**
 * Detect file type from buffer content
 */
function detectFileType(buffer: Buffer | Uint8Array): string | null {
  for (const signature of FILE_SIGNATURES) {
    for (const magicBytes of signature.magicBytes) {
      if (matchesMagicBytes(buffer, magicBytes)) {
        return signature.mimeType;
      }
    }
  }
  return null;
}

/**
 * Validate file extension matches declared MIME type
 */
export function validateFileExtension(
  fileName: string,
  declaredMimeType: string
): boolean {
  const ext = fileName.toLowerCase().split(".").pop();
  if (!ext) return false;

  const signature = FILE_SIGNATURES.find(
    (sig) => sig.mimeType === declaredMimeType
  );

  if (!signature) return true; // Unknown MIME type, skip extension check

  return signature.extensions.some(
    (validExt) => validExt === `.${ext}`
  );
}

/**
 * Full file validation (content + extension)
 */
export function validateFile(
  buffer: Buffer | Uint8Array,
  fileName: string,
  declaredMimeType: string,
  options: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
  } = {}
): ValidationResult {
  const { maxSizeBytes, allowedTypes } = options;

  // Check file size
  if (maxSizeBytes && buffer.length > maxSizeBytes) {
    return {
      valid: false,
      detectedType: null,
      error: `File too large. Maximum size is ${Math.round(maxSizeBytes / 1024 / 1024)}MB`,
    };
  }

  // Check allowed types
  if (allowedTypes && !allowedTypes.includes(declaredMimeType)) {
    return {
      valid: false,
      detectedType: null,
      error: `File type ${declaredMimeType} is not allowed`,
    };
  }

  // Check extension
  if (!validateFileExtension(fileName, declaredMimeType)) {
    return {
      valid: false,
      detectedType: null,
      error: `File extension doesn't match declared type ${declaredMimeType}`,
    };
  }

  // Check magic bytes
  return validateFileContent(buffer, declaredMimeType);
}

/**
 * Create a file validation middleware for API routes
 */
export function withFileValidation(
  options: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
  } = {}
) {
  return async (file: File): Promise<ValidationResult> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    return validateFile(buffer, file.name, file.type, options);
  };
}

// Export allowed file types for convenience
export const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  archives: ["application/zip"],
  all: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
  ],
};