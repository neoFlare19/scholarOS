const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("scholaros_token");

  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,

    headers: {
      Accept: "application/json",

      // Do not manually set Content-Type for FormData.
      // The browser will automatically add the correct
      // multipart/form-data boundary.
      ...(isFormData
        ? {}
        : {
            "Content-Type": "application/json",
          }),

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      status: response.status,
      data,
    };
  }

  return data;
}