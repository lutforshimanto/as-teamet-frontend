import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/server-api";

export async function GET() {
  try {
    const user = await serverFetch("/users/me");
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const user = await serverFetch("/users/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(user);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.delete("token");
  return response;
}
