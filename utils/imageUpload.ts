const WORKER_URL = "https://crowdchain-image-uploader.rabiuoladizz.workers.dev";

/**
 * Uploads an image to Cloudflare R2 via a worker.
 * @param file The image file to upload.
 * @returns The public URL of the uploaded image.
 */
export async function uploadImageToCloudflare(file: File): Promise<string> {
  // Sanitize the filename to be URL-friendly
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;

  // 1. Get the pre-signed upload URL from our worker
  const getUploadUrlResponse = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: filename,
      contentType: file.type,
    }),
  });

  if (!getUploadUrlResponse.ok) {
    try {
      const errorBody = await getUploadUrlResponse.json();
      console.error("Worker error response:", errorBody);
    } catch (e) {
      const errorText = await getUploadUrlResponse.text();
      console.error("Worker error response (not JSON):", errorText);
    }
    throw new Error('Failed to get a pre-signed URL from the worker.');
  }

  const { uploadUrl, publicUrl } = await getUploadUrlResponse.json();
  if (!uploadUrl || !publicUrl) {
    throw new Error('Invalid response from upload URL worker.');
  }

  // 2. Upload the file to the pre-signed URL using PUT
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("R2 upload error response:", errorText);
    throw new Error('Failed to upload image to R2.');
  }

  // 3. Return the public URL of the object
  return publicUrl;
}
