export async function fetchDashboard() {
  const response = await fetch("http://localhost:5200/api/dashboard");
  if (!response.ok) {
    throw new Error("Ошибка при загрузке данных Dashboard");
  }
  return response.json();
}