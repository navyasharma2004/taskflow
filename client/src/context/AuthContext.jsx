import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("taskflow_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: t, user: u } = res.data.data;
    localStorage.setItem("taskflow_token", t);
    setToken(t);
    setUser(u);
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    const { token: t, user: u } = res.data.data;
    localStorage.setItem("taskflow_token", t);
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("taskflow_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
