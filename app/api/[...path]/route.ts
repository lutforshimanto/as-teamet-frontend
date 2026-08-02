import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

async function proxy(req: NextRequest, path: string) {
  const token = cookies().get('token')?.value;
  const url = `${BACKEND_URL}/${path}`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text();
  }

  const backendRes = await fetch(url, init);
  const text = await backendRes.text();

  if (backendRes.status === 401) {
    cookies().delete('token');
  }

  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // keep raw text
  }

  return NextResponse.json(body, { status: backendRes.status });
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path.join('/'));
}
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const search = req.nextUrl.search;
  return proxy(req, params.path.join('/') + (search || ''));
}
export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path.join('/'));
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path.join('/'));
}
