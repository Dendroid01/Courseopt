const API_URL = "http://localhost:5200/api/deliveries";

export async function fetchDeliveries() {
  const res = await fetch("http://localhost:5200/api/deliveries");
  if (!res.ok) throw new Error("Ошибка загрузки поставок");
  return res.json();
}

export async function fetchDelivery(id) {
  const res = await fetch(`http://localhost:5200/api/deliveries/${id}`);
  if (!res.ok) throw new Error("Не удалось получить поставку");
  return res.json();
}

export async function createDelivery(order) {
  const res = await fetch("http://localhost:5200/api/deliveries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });
  if (!res.ok) throw new Error("Ошибка создания поставки");
  return res.json();
}

export async function updateDelivery(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Ошибка при обновлении заказа");
  return res.json(); // если API возвращает что-то
}

export async function deleteDelivery(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Ошибка при удалении заказа");
  return true
}

export async function deleteDeliveryItem(deliveryId, barcode) {
  const response = await fetch(`http://localhost:5200/api/deliveries/${deliveryId}/items/${barcode}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Ошибка при удалении позиции");
  }
}
