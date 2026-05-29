import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { getToken, setToken as saveToken, clearToken } from "./tokenStorage";
import apiService from "./api";

const AuthContext = createContext(null);

const parseUserFromToken = (token) => {
    if (!token) return null;
    const decoded = jwtDecode(token);
    return {
        ...decoded,
        email: decoded.email,
        role: decoded.role
    };
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(() => parseUserFromToken(getToken()));

  useEffect(() => {
    const t = getToken();
    if (t) {
      apiService.setAuthToken(t);
    }
  }, []);

  useEffect(() => {
    const onTokenChanged = () => {
      const t = getToken();
      setTokenState(t);
      setUser(parseUserFromToken(t));
      apiService.setAuthToken(t);
    };

    window.addEventListener("token-changed", onTokenChanged);
    window.addEventListener("storage", onTokenChanged);
    return () => {
      window.removeEventListener("token-changed", onTokenChanged);
      window.removeEventListener("storage", onTokenChanged);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.auth.login(email, password);
      const { token } = response.data;
      
      if (!token) throw new Error("No token returned from server");

      saveToken(token);
      const parsedUser = parseUserFromToken(token);
      setTokenState(token);
      setUser(parsedUser);
      apiService.setAuthToken(token);
      
      return { role: parsedUser.role };
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
    apiService.setAuthToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

