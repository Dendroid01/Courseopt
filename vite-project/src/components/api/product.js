const API_URL = "http://localhost:5200/api/products";

// -------------------------
// Получение всех товаров
// -------------------------
export async function fetchProducts() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Ошибка загрузки товаров");
  return res.json();
}

// -------------------------
// Создание нового товара
// -------------------------
export async function createProduct(product) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Ошибка при создании товара");
  return res.json();
}

// -------------------------
// Обновление существующего товара
// -------------------------
export async function updateProduct(barcode, product) {
  const res = await fetch(`${API_URL}/${barcode}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Ошибка при обновлении товара");
  if (res.status === 204) return null;
  return res.json();
}

// -------------------------
// Удаление товара
// -------------------------
export async function deleteProduct(barcode) {
  const res = await fetch(`${API_URL}/${barcode}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Ошибка при удалении товара");
  return true;
}
