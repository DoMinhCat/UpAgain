const baseUrl = import.meta.env.VITE_API_BASE_URL;
export const resolveUrl = (path: string) =>
  path.startsWith("http") ? path : `${baseUrl}/${path}`;
