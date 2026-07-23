const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function apiFetch(path, options = {}) {
    return fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: "include",
    });
}
