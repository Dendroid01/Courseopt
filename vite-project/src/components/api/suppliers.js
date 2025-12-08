// api/suppliers.js
import { useApiClient } from "../utils/apiClient";

const API_URL = "http://localhost:5200/api/suppliers";

export const useSuppliersApi = () => {
  const { apiClient } = useApiClient();

  return {
    fetchSuppliers: () => apiClient(API_URL),
    createSupplier: (dto) => apiClient(API_URL, { method: "POST", body: JSON.stringify(dto) }),
    updateSupplier: (id, dto) => apiClient(`${API_URL}/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
    deleteSupplier: (id) => apiClient(`${API_URL}/${id}`, { method: "DELETE" }),
  };
};
