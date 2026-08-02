import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverFetch } from '@/lib/server-api';

export async function GET() {
  try {
    const user = await serverFetch('/users/me');
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.delete('token');
  return response;
}
