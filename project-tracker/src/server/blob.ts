import { del } from "@vercel/blob";

const UPLOAD_ENDPOINT = process.env.BLOB_UPLOAD_ENDPOINT ?? "https://api.vercel.com/v2/blob/generate-upload-url";

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.warn("BLOB_READ_WRITE_TOKEN is missing. Uploads will fall back to mock URLs.");
}

export async function createSignedUploadUrl({
  pathname,
  contentType,
  checksum,
}: {
  pathname: string;
  contentType: string;
  checksum?: string;
}) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return {
      url: `/api/blob/mock-upload?pathname=${encodeURIComponent(pathname)}`,
      pathname,
    };
  }

  try {
    const response = await fetch(UPLOAD_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pathname, contentType, checksum, access: "public" }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Failed to create upload URL: ${message}`);
    }

    const json = (await response.json()) as { uploadUrl: string; pathname: string };
    return { url: json.uploadUrl, pathname: json.pathname };
  } catch (error) {
    console.error("Blob signed URL error", error);
    return {
      url: `/api/blob/mock-upload?pathname=${encodeURIComponent(pathname)}`,
      pathname,
    };
  }
}

export async function deleteBlob(url: string) {
  if (!url) return;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;
  await del(url, { token });
}
