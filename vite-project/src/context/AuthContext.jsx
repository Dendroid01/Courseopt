import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Инициализация состояния из localStorage
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // login сохраняет в localStorage и в состояние
  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // logout очищает localStorage и состояние
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Опционально: синхронизация между вкладками
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // token и role для удобного доступа
  const token = user?.token || null;
  const role = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};