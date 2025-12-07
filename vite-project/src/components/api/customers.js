export async function fetchCustomers() {
  const res = await fetch("http://localhost:5200/api/customers");
  if (!res.ok) throw new Error("Ошибка загрузки клиентов");
  return res.json();
}
