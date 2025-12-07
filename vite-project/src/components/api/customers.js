const API_URL = "http://localhost:5200/api/customers";

export async function fetchCustomers() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Ошибка загрузки клиентов");
  return res.json();
}

export async function fetchCustomer(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Клиент не найден");
  return res.json();
}

export async function createCustomer(dto) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("Ошибка создания клиента: " + text);
  }
  return res.json();
}

export async function updateCustomer(id, dto) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("Ошибка обновления клиента: " + text);
  }
    if (res.status === 204) return null;
  return res.json();
}

export async function deleteCustomer(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("Ошибка удаления клиента: " + text);
  }
}