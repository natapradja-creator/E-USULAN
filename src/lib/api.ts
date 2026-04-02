export const API_URL = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_URL}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("API returned non-JSON response:", text);
    throw new Error('API returned non-JSON response');
  }
}

export async function fetchUsulan(params: any) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/usulan?${query}`);
  if (!res.ok) throw new Error('Failed to fetch usulan');
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("API returned non-JSON response:", text);
    throw new Error('API returned non-JSON response');
  }
}

export async function checkDuplicates(ids: string[]) {
  const res = await fetch(`${API_URL}/usulan/check-duplicates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to check duplicates');
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("API returned non-JSON response:", text);
    throw new Error('API returned non-JSON response');
  }
}

export async function importUsulan(data: any[]) {
  const res = await fetch(`${API_URL}/usulan/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error('Failed to import data');
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("API returned non-JSON response:", text);
    throw new Error('API returned non-JSON response');
  }
}

export async function validateUsulan(id: string, payload: { status: string; catatan: string; validator: string; anggaran?: string; volume?: string; satuan?: string }) {
  const res = await fetch(`${API_URL}/usulan/${id}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to validate usulan');
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("API returned non-JSON response:", text);
    throw new Error('API returned non-JSON response');
  }
}

export async function bulkDeleteUsulan(ids: string[]) {
  const res = await fetch(`${API_URL}/usulan/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to delete usulan');
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("API returned non-JSON response:", text);
    throw new Error('API returned non-JSON response');
  }
}

export async function clearUsulan(kategori?: string) {
  const url = kategori ? `${API_URL}/usulan/clear?kategori=${kategori}` : `${API_URL}/usulan/clear`;
  const res = await fetch(url, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear usulan');
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("API returned non-JSON response:", text);
    throw new Error('API returned non-JSON response');
  }
}
