/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api.ts
// export const API_BASE_URL = "http://localhost:3000";

export const API_BASE_URL = "https://api.kalariyo.com"

// ---- Admin key storage ----
const ADMIN_KEY = "my-secret-upload-key";
const ADMIN_SECRET = "dummy-client-secret";
// CLIENT_ID=dummy-client-id
// CLIENT_SECRET=dummy-client-secret

export function getAdminClientKey(): string {
  return ADMIN_KEY;
}

export function getAdminSecretKey(): string {
  return ADMIN_SECRET;
}

export function setAdminClientKey(key: string) {
  // localStorage.setItem(ADMIN_KEY, key);
  console.log("key ", key)
}

export function clearAdminClientKey() {
  // localStorage.removeItem(ADMIN_KEY_STORAGE);
}

// ---- Category types ----

export interface CategoryLabels {
  [lang: string]: string; // en, hi, etc
}

export interface Category {
  key: string;                   // Festival
  labels?: CategoryLabels;       // { en: "Festival", hi: "त्योहार" }
}


export interface CategoryListResponse {
  categories: Category[];
}


// ---- Helper for JSON requests ----
async function apiJson<T>(
  path: string,
  options: RequestInit & { skipContentType?: boolean } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});
  const adminKey = getAdminClientKey();
  const adminScret = getAdminSecretKey();

  if (adminKey) {
    headers.set("X-Client-Key", adminKey);
    headers.set("X-Client-Secret", adminScret);
  }

  if (!options.skipContentType) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ---- Types ----

export interface ConstantListResponse {
  message: string[]; // from your Go controller
}

export interface ApiImageRaw {
  id: string;
  image_url: string;
  video_url?: string | null;
  thumbnail_url?: string | null;
  media_type?: "image" | "video";
  category: string;
  language: string;
  position: number;
  version: "v1" | "v2";
  layout?: any | null;
  is_date: boolean;
  show_on_date?: string | null;
  created_at: string;
}

export interface Image {
  id: string;
  imageUrl: string;
  videoUrl?: string | null;
  mediaType: "image" | "video";
  category: string;
  language: string;

  version: "v1" | "v2";
  position: number;
  layout?: any | null;

  isDate: boolean;
  showOnDate?: string | null;
  createdAt: string;
}



export function mapImage(raw: ApiImageRaw): Image {
  return {
    id: raw.id,
    imageUrl: raw.image_url,
    videoUrl: raw.video_url ?? null,
    mediaType: raw.media_type ?? "image",
    category: raw.category,
    language: raw.language,

    version: raw.version ?? "v1",
    position: raw.position,
    layout: raw.layout ?? null,

    isDate: raw.is_date,
    showOnDate: raw.show_on_date ?? null,
    createdAt: raw.created_at,
  };
}



// ---- Config APIs ----

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiJson<CategoryListResponse>(
    "/admin/config/categories",
    { method: "GET" }
  );
  return res.categories || [];
}


export async function updateCategories(categories: Category[]): Promise<void> {
  await apiJson("/admin/config/categories", {
    method: "POST",
    body: JSON.stringify({ categories }),
  });
}


export async function fetchLanguages(): Promise<string[]> {
  const res = await apiJson<ConstantListResponse>(
    "/admin/config/languages",
    { method: "GET" }
  );
  return res.message || [];
}

export async function updateLanguages(languages: string[]): Promise<void> {
  await apiJson("/admin/config/languages", {
    method: "POST",
    body: JSON.stringify({ languages }),
  });
}

// ---- Images APIs ----

export interface ImageListResponse {
  images: ApiImageRaw[];
}

export interface ImageListParams {
  category?: string;
  language?: string;
}

export async function fetchImages(params: ImageListParams = {}): Promise<Image[]> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.language) query.set("language", params.language);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const res = await apiJson<ImageListResponse>(`/admin/images${suffix}`, {
    method: "GET",
  });
  return (res.images || []).map(mapImage);
}

export async function deleteImage(id: string): Promise<void> {
  await apiJson(`/admin/images/${id}`, {
    method: "DELETE",
  });
}

export interface UploadImagePayload {
  file: File;
  thumbnail?: File | null;
  mediaType?: "image" | "video";
  category: string;
  language: string;

  version: "v1" | "v2";
  position?: number;      // v1 only
  layout?: object | null; // v2 only

  isDate: boolean;
  showOnDate?: string | null;
}

export async function uploadImage(payload: UploadImagePayload): Promise<Image> {
  const form = new FormData();

  form.append("file", payload.file);
  form.append("media_type", payload.mediaType ?? "image");
  form.append("category", payload.category);
  form.append("language", payload.language);
  form.append("version", payload.version);
  form.append("is_date", payload.isDate ? "true" : "false");

  if (payload.version === "v1") {
    form.append("position", String(payload.position ?? 0));
  }

  if (payload.version === "v2" && payload.layout) {
    form.append("layout", JSON.stringify(payload.layout));
  }

  if (payload.showOnDate) {
    form.append("show_on_date", payload.showOnDate);
  }

  if (payload.mediaType === "video" && payload.thumbnail) {
    form.append("thumbnail", payload.thumbnail);
  }

  const headers: HeadersInit = {};
  const adminKey = getAdminClientKey();
  if (adminKey) {
    (headers as any)["X-Client-Key"] = adminKey;
  }

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed`);
  }

  const data = await res.json();
  return mapImage(data.media);
}


