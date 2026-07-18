const BASE_URL = "http://localhost:8000";

export function apiFetch(path, options = {}) {
    return fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: "include",
    });
}
