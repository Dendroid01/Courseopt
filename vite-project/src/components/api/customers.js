// api/customers.js
import { useApiClient } from "../utils/apiClient";

const API_URL = "http://localhost:5200/api/customers";

export const useCustomersApi = () => {
  const { apiClient } = useApiClient();

  return {
    fetchCustomers: () => apiClient(API_URL),
    fetchCustomer: (id) => apiClient(`${API_URL}/${id}`),
    createCustomer: (dto) => apiClient(API_URL, { method: "POST", body: JSON.stringify(dto) }),
    updateCustomer: (id, dto) => apiClient(`${API_URL}/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
    deleteCustomer: (id) => apiClient(`${API_URL}/${id}`, { method: "DELETE" }),
  };
};