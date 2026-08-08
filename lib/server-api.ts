import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

export async function serverFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = cookies().get("token")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}/${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function getToken(): string | undefined {
  return cookies().get("token")?.value;
}
