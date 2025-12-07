const API_URL = "http://localhost:5200/api/orders";

export async function fetchOrders() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Не удалось получить заказы");
  return res.json();
}

export async function fetchOrder(id) {
  const res = await fetch(`http://localhost:5200/api/orders/${id}`);
  if (!res.ok) throw new Error("Не удалось получить заказ");
  return res.json();
}

export async function createOrder(order) {
  const res = await fetch("http://localhost:5200/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });
  if (!res.ok) throw new Error("Ошибка создания заказа");
  return res.json();
}

export async function updateOrder(id, data) {
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

export async function deleteOrder(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Ошибка при удалении заказа");
  return true
}

export async function deleteOrderItem(orderId, barcode) {
  const res = await fetch(`http://localhost:5200/api/orders/${orderId}/items/${barcode}`, {
    method: "DELETE"
  });

  if (!res.ok) throw new Error("Ошибка при удалении позиции заказа");

  return true;
}
