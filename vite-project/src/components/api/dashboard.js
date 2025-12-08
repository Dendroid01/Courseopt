// api/dashboard.js
import { useApiClient } from "../utils/apiClient";

const API_URL = "http://localhost:5200/api/dashboard";

export const useDashboardApi = () => {
  const { apiClient } = useApiClient();

  return {
    fetchDashboard: () => apiClient(API_URL),
  };
};