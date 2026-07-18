import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const BASE_URL = "http://localhost:8000";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${BASE_URL}/auth/me`, { credentials: "include" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setUser(data))
            .finally(() => setLoading(false));
    }, []);

    function register(email, password) {
        return fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
    }

    function login(email, password) {
        return fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        }).then((res) => {
            if (!res.ok) throw new Error("Invalid email or password");
            return res.json();
        }).then((data) => setUser(data));
    }

    function logout() {
        return fetch(`${BASE_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        }).then(() => setUser(null));
    }

    const value = { user, loading, login, register, logout };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}