// src/services/useAuth.js   (update)
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setToken as saveToken, getToken } from "../services/tokenStorage";

export function useAuth() {
  const navigate = useNavigate();

  const login = useCallback(async (email, password) => {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    const token = res.data.token || res.data.jwt || res.data.accessToken || res.data.access_token;
    if (!token) throw new Error("No token in login response");

    // Persist token via central helper (sets both keys for compatibility)
    saveToken(token);
    localStorage.setItem("aba_email", email);

    return token;
  }, []);

  const logout = useCallback(() => {
    // use helper to clear both keys
    localStorage.removeItem("aba_email");
    // tokenStorage.clearToken() could be used here if you import it
    localStorage.removeItem("jwt");
    localStorage.removeItem("access_token");
    navigate("/login");
  }, [navigate]);

  // Expose the current token (reads the canonical key or legacy)
  const token = getToken();

  return { token, login, logout };
}
