// api/products.js
import { useApiClient } from "../utils/apiClient";

const API_URL = "http://localhost:5200/api/products";

export const useProductsApi = () => {
  const { apiClient } = useApiClient();

  return {
    fetchProducts: () => apiClient(API_URL),
    createProduct: (dto) => apiClient(API_URL, { method: "POST", body: JSON.stringify(dto) }),
    updateProduct: (barcode, dto) => apiClient(`${API_URL}/${barcode}`, { method: "PUT", body: JSON.stringify(dto) }),
    deleteProduct: (barcode) => apiClient(`${API_URL}/${barcode}`, { method: "DELETE" }),
  };
};
