// api/deliveries.js
import { useApiClient } from "../utils/apiClient";

const API_URL = "http://localhost:5200/api/deliveries";

export const useDeliveriesApi = () => {
  const { apiClient } = useApiClient();

  return {
    fetchDeliveries: () => apiClient(API_URL),
    fetchDelivery: (id) => apiClient(`${API_URL}/${id}`),
    createDelivery: (dto) => apiClient(API_URL, { method: "POST", body: JSON.stringify(dto) }),
    updateDelivery: (id, dto) => apiClient(`${API_URL}/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
    deleteDelivery: (id) => apiClient(`${API_URL}/${id}`, { method: "DELETE" }),
    deleteDeliveryItem: (deliveryId, barcode) => apiClient(`${API_URL}/${deliveryId}/items/${barcode}`, { method: "DELETE" }),
  };
};