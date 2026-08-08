import { NextRequest, NextResponse } from "next/server";
import { buildObjectKey, getUploadValidation, uploadToR2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const customKey = formData.get("key");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    getUploadValidation(file);

    const safeCustomKey = typeof customKey === "string" ? customKey.trim() : "";
    const key = safeCustomKey || buildObjectKey(file.name);

    const uploaded = await uploadToR2(file, key);

    return NextResponse.json({
      success: true,
      url: uploaded.url,
      key: uploaded.key,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    const status = message.includes("Missing Cloudflare R2") ? 500 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
