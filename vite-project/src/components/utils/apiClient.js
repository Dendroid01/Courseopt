// utils/apiClient.js
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export const useApiClient = () => {
  const { user } = useContext(AuthContext);

  const apiClient = async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(user?.token && { "Authorization": `Bearer ${user.token}` }),
      ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Ошибка при запросе к API");
    }

    if (res.status === 204) return null; // PUT/DELETE без тела
    return res.json();
  };

  return { apiClient };
};
