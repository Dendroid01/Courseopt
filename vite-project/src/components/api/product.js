export async function fetchProducts() {
  const res = await fetch("http://localhost:5200/api/products");
  if (!res.ok) throw new Error("Ошибка загрузки товаров");
  return res.json();
}
