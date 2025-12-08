// api/orders.js
import { useApiClient } from "../utils/apiClient";

const API_URL = "http://localhost:5200/api/orders";

export const useOrdersApi = () => {
  const { apiClient } = useApiClient();

  return {
    fetchOrders: () => apiClient(API_URL),
    fetchOrder: (id) => apiClient(`${API_URL}/${id}`),
    createOrder: (dto) => apiClient(API_URL, { method: "POST", body: JSON.stringify(dto) }),
    updateOrder: (id, dto) => apiClient(`${API_URL}/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
    deleteOrder: (id) => apiClient(`${API_URL}/${id}`, { method: "DELETE" }),
    deleteOrderItem: (orderId, barcode) => apiClient(`${API_URL}/${orderId}/items/${barcode}`, { method: "DELETE" }),
  };
};