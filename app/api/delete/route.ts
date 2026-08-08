import { NextRequest, NextResponse } from "next/server";
import { deleteFromR2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    await deleteFromR2(key);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
