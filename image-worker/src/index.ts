import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface Env {
  CLOUDFLARE_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Be more specific in production
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (request.method !== 'POST') {
        return new Response('Expected POST request', { status: 405, headers: corsHeaders });
      }

      let reqBody;
      try {
          reqBody = await request.json();
      } catch (e) {
          return new Response('Invalid JSON body', { status: 400, headers: corsHeaders });
      }

      const { filename, contentType } = reqBody as any;
      if (!filename || !contentType) {
        return new Response('Request body must include filename and contentType', { status: 400, headers: corsHeaders });
      }

      const S3 = new S3Client({
        region: "auto",
        endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
      });

      const signedUrl = await getSignedUrl(
        S3,
        new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: filename,
          ContentType: contentType,
        }),
        { expiresIn: 3600 }
      );

      const publicUrl = `${env.R2_PUBLIC_URL}/${filename}`;

      return new Response(JSON.stringify({
        uploadUrl: signedUrl,
        publicUrl: publicUrl,
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    } catch (error) {
      console.error('Worker Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};
