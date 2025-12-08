import { useApiClient } from "../utils/apiClient";

export const useUsersApi = () => {
  const { apiClient } = useApiClient();
  const API_URL = "http://localhost:5200/api/users";

  return {
    fetchUsers: () => apiClient(API_URL),
    updateUser: (id, dto) => apiClient(`${API_URL}/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
    deleteUser: (id) => apiClient(`${API_URL}/${id}`, { method: "DELETE" }),
    createUser: (dto) => apiClient(API_URL, { method: "POST", body: JSON.stringify(dto) }),
  };
};
