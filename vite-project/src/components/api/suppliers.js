export async function fetchSuppliers() {
  const res = await fetch("http://localhost:5200/api/suppliers");
  if (!res.ok) throw new Error("Ошибка загрузки поставщиков");
  return res.json();
}
