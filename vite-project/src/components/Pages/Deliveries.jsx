import { useEffect, useState, useMemo } from "react";
import Layout from "../Layout/Layout";
import { fetchDeliveries, createDelivery, updateDelivery, deleteDelivery, deleteDeliveryItem } from "../api/deliveries";
import { fetchSuppliers } from "../api/suppliers";
import { fetchProducts } from "../api/product";

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Фильтры
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Сортировка
  const [sortField, setSortField] = useState("deliveryDate");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    loadDeliveries();
    loadSuppliers();
    loadProducts();
  }, []);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const data = await fetchDeliveries();
      setDeliveries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await fetchSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error("Ошибка загрузки поставщиков:", err.message);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Ошибка загрузки товаров:", err.message);
    }
  };

  // -------------------------
  // УСТАНОВКА ВЫБРАННОЙ ПОСТАВКИ
  // -------------------------
  const setSelectedDeliveryWithProducts = (delivery) => {
    if (!delivery) return;
    const updatedItems = delivery.items.map(item => {
      const foundProduct = products.find(p => p.barcode === item.productBarcode);
      return {
        ...item,
        suggestions: [],
        unitPrice: foundProduct?.unitPrice ?? 0
      };
    });
    setSelectedDelivery({ ...delivery, items: updatedItems });
  };

  // -------------------------
  // АВТОПОДСКАЗКА ТОВАРОВ
  // -------------------------
  const handleProductSearch = (idx, text) => {
    const updated = [...selectedDelivery.items];
    updated[idx].productName = text;

    if (!text) {
      updated[idx].suggestions = [];
    } else {
      updated[idx].suggestions = products.filter(p =>
        p.name.toLowerCase().includes(text.toLowerCase())
      );
    }

    setSelectedDelivery({ ...selectedDelivery, items: updated });
  };

  const handleSelectProduct = (idx, product) => {
    const updated = [...selectedDelivery.items];

    updated[idx].productBarcode = product.barcode;
    updated[idx].productName = product.name;
    updated[idx].priceAtOrder = product.unitPrice ?? 0;
    updated[idx].markupPercent = 0;
    updated[idx].finalPrice = product.unitPrice ?? 0;
    updated[idx].suggestions = [];
    updated[idx].stock = product.currentStock ?? 0;

    setSelectedDelivery({ ...selectedDelivery, items: updated });
  };

  // -------------------------
  // ДОБАВЛЕНИЕ ПОЗИЦИИ
  // -------------------------
  const handleAddItem = () => {
    const newItem = {
      productBarcode: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      productionDate: null,
      expirationDate: null,
      suggestions: []
    };
    setSelectedDelivery({ ...selectedDelivery, items: [...selectedDelivery.items, newItem] });
  };

  const handleDeleteItem = async (barcode) => {
    if (!selectedDelivery) return;
    if (!confirm("Удалить позицию заказа?")) return;

    setSaving(true);

    try {
      await deleteDeliveryItem(selectedDelivery.id, barcode);

      // Удаляем локально
      setSelectedDelivery({
        ...selectedDelivery,
        items: selectedDelivery.items.filter(i => i.productBarcode !== barcode)
      });

      // Обновляем список заказов (с уже пересчитанной суммой)
      loadDeliveries();

    } catch (err) {
      alert("Ошибка при удалении позиции: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // ИЗМЕНЕНИЕ ПОЗИЦИИ
  // -------------------------
  const handleChangeItem = (idx, field, value) => {
    const updated = [...selectedDelivery.items];
    updated[idx][field] = value;
    setSelectedDelivery({ ...selectedDelivery, items: updated });
  };

  // -------------------------
  // СОХРАНЕНИЕ ПОСТАВКИ
  // -------------------------
  const handleSave = async () => {
    if (!selectedDelivery) return;
    setSaving(true);
    try {
      const updated = selectedDelivery.id === 0
        ? await createDelivery(selectedDelivery)
        : await updateDelivery(selectedDelivery.id, selectedDelivery);

      setDeliveries(prev =>
        prev.some(d => d.id === updated.id)
          ? prev.map(d => (d.id === updated.id ? updated : d))
          : [...prev, updated]
      );
      setSelectedDelivery(updated);
    } catch (err) {
      alert("Ошибка при сохранении: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // УДАЛЕНИЕ ПОСТАВКИ
  // -------------------------
  const handleDelete = async () => {
    if (!selectedDelivery) return;
    if (!confirm("Удалить поставку?")) return;
    setSaving(true);
    try {
      await deleteDelivery(selectedDelivery.id);
      setSelectedDelivery(null);
      loadDeliveries();
    } catch (err) {
      alert("Ошибка при удалении: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // ФИЛЬТРАЦИЯ + СОРТИРОВКА
  // -------------------------
  const statuses = useMemo(() => [...new Set(deliveries.map(d => d.status))], [deliveries]);

  const filteredDeliveries = useMemo(() => {
    let result = [...deliveries];
    if (filterSupplier) result = result.filter(d => d.supplierInn === filterSupplier);
    if (filterStatus) result = result.filter(d => d.status === filterStatus);
    if (filterFrom) result = result.filter(d => new Date(d.deliveryDate) >= new Date(filterFrom));
    if (filterTo) result = result.filter(d => new Date(d.deliveryDate) <= new Date(filterTo));

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === "deliveryDate") { valA = new Date(valA); valB = new Date(valB); }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [deliveries, filterSupplier, filterStatus, filterFrom, filterTo, sortField, sortOrder]);

  const handleSort = field => {
    if (sortField === field) setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
  };

  const renderSortIndicator = field => sortField === field ? (sortOrder === "asc" ? " ▲" : " ▼") : null;

  const resetFilters = () => {
    setFilterSupplier(""); setFilterStatus(""); setFilterFrom(""); setFilterTo("");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Поставки</h1>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div>
          <label className="mr-1">Поставщик:</label>
          <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Все</option>
            {suppliers.map(s => <option key={s.inn} value={s.inn}>{s.companyName}</option>)}
          </select>
        </div>

        <div>
          <label className="mr-1">Статус:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Все</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="mr-1">С:</label>
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="border rounded px-2 py-1" />
        </div>

        <div>
          <label className="mr-1">По:</label>
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="border rounded px-2 py-1" />
        </div>

        <button onClick={() => setSelectedDelivery({ id: 0, supplierInn: "", supplierName: "", deliveryDate: new Date().toISOString().slice(0, 10), status: "в_обработке", items: [] })} className="bg-gray-300 px-3 py-1 rounded">+ Создать поставку</button>
        <button onClick={resetFilters} className="bg-gray-300 px-3 py-1 rounded">Сбросить фильтры</button>
      </div>

      {/* Таблица поставок */}
      {loading ? <p>Загрузка...</p> : error ? <p className="text-red-500">{error}</p> : (
        <table className="min-w-full bg-white border rounded">
          <thead className="bg-gray-200 cursor-pointer">
            <tr>
              <th className="py-2 px-4 border" onClick={() => handleSort("id")}>ID {renderSortIndicator("id")}</th>
              <th className="py-2 px-4 border" onClick={() => handleSort("supplierName")}>Поставщик {renderSortIndicator("supplierName")}</th>
              <th className="py-2 px-4 border" onClick={() => handleSort("deliveryDate")}>Дата {renderSortIndicator("deliveryDate")}</th>
              <th className="py-2 px-4 border" onClick={() => handleSort("totalAmount")}>Сумма {renderSortIndicator("totalAmount")}</th>
              <th className="py-2 px-4 border" onClick={() => handleSort("status")}>Статус {renderSortIndicator("status")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.map(d => (
              <tr key={d.id} className="text-center hover:bg-gray-100 cursor-pointer" onClick={() => setSelectedDeliveryWithProducts(d)}>
                <td className="py-2 px-4 border">{d.id}</td>
                <td className="py-2 px-4 border">{d.supplierName}</td>
                <td className="py-2 px-4 border">{new Date(d.deliveryDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border">{(d.totalAmount ?? 0).toFixed(2)}</td>
                <td className="py-2 px-4 border">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Модалка */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative max-h-[80vh] overflow-auto">
            <button className="absolute top-2 right-2" onClick={() => setSelectedDelivery(null)}>✕</button>
            <h2 className="text-xl font-bold mb-4">Поставка #{selectedDelivery.id === 0 ? "новая" : selectedDelivery.id}</h2>

            <div className="mb-4 flex flex-col gap-2">
              <div>
                <label>Поставщик:</label>
                <select value={selectedDelivery.supplierInn} onChange={e => setSelectedDelivery({ ...selectedDelivery, supplierInn: e.target.value })} className="border rounded px-2 py-1 w-full">
                  <option value="">Выберите поставщика</option>
                  {suppliers.map(s => <option key={s.inn} value={s.inn}>{s.companyName}</option>)}
                </select>
              </div>
              <div>
                <label>Дата:</label>
                <input type="date" value={selectedDelivery.deliveryDate} onChange={e => setSelectedDelivery({ ...selectedDelivery, deliveryDate: e.target.value })} className="border rounded px-2 py-1" />
              </div>
              <div>
                <label>Статус:</label>
                <select value={selectedDelivery.status} onChange={e => setSelectedDelivery({ ...selectedDelivery, status: e.target.value })} className="border rounded px-2 py-1">
                  <option value="в_обработке">в_обработке</option>
                  <option value="подтвержден">подтвержден</option>
                  <option value="оплачен">оплачен</option>
                  <option value="отгружен">отгружен</option>
                  <option value="завершен">завершен</option>
                  <option value="отменен">отменен</option>
                </select>
              </div>
            </div>

            <button onClick={handleAddItem} className="bg-green-200 px-3 py-1 rounded mb-2">+ Добавить позицию</button>

            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-1 px-2 border">Товар</th>
                  <th className="py-1 px-2 border">Кол-во</th>
                  <th className="py-1 px-2 border">Цена</th>
                  <th className="py-1 px-2 border">Дата производства</th>
                  <th className="py-1 px-2 border">Срок годности</th>
                  <th className="py-1 px-2 border">Действие</th>
                </tr>
              </thead>
              <tbody>
                {selectedDelivery.items.map((item, idx) => (
                  <tr key={idx} className="text-center relative">
                    <td className="py-1 px-2 border relative">
                      <input
                        type="text"
                        value={item.productName ?? ""}
                        onChange={e => handleProductSearch(idx, e.target.value)}
                        className="border rounded w-full px-1"
                        placeholder="Введите название" />

                      {item.suggestions?.length > 0 && (
                        <div className="absolute bg-white border rounded shadow-md z-50 w-full max-h-40 overflow-y-auto">
                          {item.suggestions.map(p => (
                            <div key={p.barcode} className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-left" onClick={() => handleSelectProduct(idx, p)}>{p.name}</div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-1 px-2 border">
                      <input type="number" value={item.quantity} onChange={e => handleChangeItem(idx, "quantity", +e.target.value)} className="w-16 border rounded text-center" />
                    </td>
                    <td className="py-1 px-2 border">
                      <input type="number" value={item.unitPrice} onChange={e => handleChangeItem(idx, "unitPrice", +e.target.value)} className="w-20 border rounded text-center" />
                    </td>
                    <td className="py-1 px-2 border">
                      <input type="date" value={item.productionDate ?? ""} onChange={e => handleChangeItem(idx, "productionDate", e.target.value)} className="border rounded w-32 px-1" />
                    </td>
                    <td className="py-1 px-2 border">
                      <input type="date" value={item.expirationDate ?? ""} readOnly className="border rounded w-32 px-1" />
                    </td>
                    <td className="py-1 px-2 border">
                      <button
                        onClick={() => handleDeleteItem(item.productBarcode)}
                        className="text-red-500 font-bold hover:text-red-700"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={handleSave} disabled={saving} className="bg-blue-200 px-4 py-2 rounded">Сохранить</button>
              <button onClick={handleDelete} disabled={saving || selectedDelivery.id === 0} className="bg-red-200 px-4 py-2 rounded">Удалить</button>
              <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setSelectedDelivery(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}