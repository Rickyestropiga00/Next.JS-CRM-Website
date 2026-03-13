export async function fetchData(type: string) {
  const res = await fetch(`/api/${type}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${type}`);
  }

  const data = await res.json();
  return data;
}
