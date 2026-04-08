import { NextResponse } from 'next/server';
export async function fetchData(type: string) {
  const res = await fetch(`/api/${type}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: `Failed to fetch ${type}` },
      { status: 500 }
    );
  }

  const data = await res.json();
  return data;
}
