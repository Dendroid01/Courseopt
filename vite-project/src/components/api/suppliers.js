const API_URL = "http://localhost:5200/api/suppliers";

export async function fetchSuppliers() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Ошибка загрузки поставщиков");
  return res.json();
}

export async function createSupplier(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка при создании поставщика");
  return res.json();
}

export async function updateSupplier(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка при обновлении поставщика");
}

export async function deleteSupplier(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Ошибка при удалении поставщика");
}
