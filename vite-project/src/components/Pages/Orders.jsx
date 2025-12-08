import { useEffect, useState, useMemo } from "react";
import Layout from "../Layout/Layout";
import { useOrdersApi } from "../api/orders";
import { useCustomersApi } from "../api/customers";
import { useProductsApi } from "../api/product";

export default function Orders() {
  const { fetchOrders, updateOrder, deleteOrder, createOrder, deleteOrderItem } = useOrdersApi();
  const { fetchCustomers } = useCustomersApi();
  const { fetchProducts } = useProductsApi();
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Фильтры
  const [filterClient, setFilterClient] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Сортировка
  const [sortField, setSortField] = useState("orderDate");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    loadOrders();
    loadClients();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await fetchCustomers();
      setClients(data);
    } catch (err) {
      console.error("Ошибка при загрузке клиентов:", err.message);
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
  // УСТАНОВКА ЗАКАЗА С АКТУАЛЬНЫМИ ОСТАТКАМИ
  // -------------------------
  const setSelectedOrderWithStock = (order) => {
    if (!order) return;

    const updatedItems = order.items.map(item => {
      const foundProduct = products.find(
        p => p.name.toLowerCase() === item.productName.toLowerCase()
      );
      return {
        ...item,
        stock: foundProduct?.currentStock ?? 0,
        suggestions: []
      };
    });

    setSelectedOrder({ ...order, items: updatedItems });
  };

  // -------------------------
  // АВТОПОДСКАЗКА ТОВАРОВ
  // -------------------------
  const handleProductSearch = (idx, text) => {
    const updated = [...selectedOrder.items];
    updated[idx].productName = text;

    if (!text) {
      updated[idx].suggestions = [];
    } else {
      updated[idx].suggestions = products.filter(p =>
        p.name.toLowerCase().includes(text.toLowerCase())
      );
    }

    setSelectedOrder({ ...selectedOrder, items: updated });
  };

  const handleSelectProduct = (idx, product) => {
    const updated = [...selectedOrder.items];

    updated[idx].productBarcode = product.barcode;
    updated[idx].productName = product.name;
    updated[idx].priceAtOrder = product.unitPrice ?? 0;
    updated[idx].markupPercent = 0;
    updated[idx].finalPrice = product.unitPrice ?? 0;
    updated[idx].suggestions = [];
    updated[idx].stock = product.currentStock ?? 0;

    setSelectedOrder({ ...selectedOrder, items: updated });
  };

  // -------------------------
  // ДОБАВИТЬ ПОЗИЦИЮ
  // -------------------------
  const handleAddItem = () => {
    const newItem = {
      productBarcode: "",
      productName: "",
      quantity: 1,
      markupPercent: 0,
      priceAtOrder: 0,
      finalPrice: 0,
      stock: 0,
      suggestions: []
    };

    setSelectedOrder({
      ...selectedOrder,
      items: [...selectedOrder.items, newItem]
    });
  };

  const handleDeleteItem = async (barcode) => {
    if (!selectedOrder) return;
    if (!confirm("Удалить позицию заказа?")) return;

    setSaving(true);

    try {
      await deleteOrderItem(selectedOrder.id, barcode);

      // Удаляем локально
      setSelectedOrder({
        ...selectedOrder,
        items: selectedOrder.items.filter(i => i.productBarcode !== barcode)
      });

      // Обновляем список заказов (с уже пересчитанной суммой)
      loadOrders();

    } catch (err) {
      alert("Ошибка при удалении позиции: " + err.message);
    } finally {
      setSaving(false);
    }
  };


  // -------------------------
  // ОБНОВЛЕНИЕ ПОЛЕЙ ПОЗИЦИИ
  // -------------------------
  const handleChangeItem = (index, field, value) => {
    const newItems = [...selectedOrder.items];
    let newValue = value;

    if (field === "quantity") {
      const productName = newItems[index].productName;
      const found = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
      if (found) {
        if (value > (found.currentStock ?? 0)) {
          newValue = found.currentStock ?? 0;
          alert(`Максимальное доступное количество: ${found.currentStock}`);
        }
      }
    }

    newItems[index][field] = newValue;

    // Пересчет цены
    const item = newItems[index];
    if (["quantity", "markupPercent", "priceAtOrder"].includes(field)) {
      const price = item.priceAtOrder ?? 0;
      const qty = item.quantity ?? 1;
      const markup = item.markupPercent ?? 0;
      item.finalPrice = price * qty * (1 + markup / 100);
    }

    setSelectedOrder({ ...selectedOrder, items: newItems });
  };

  // -------------------------
  // СОХРАНЕНИЕ ЗАКАЗА
  // -------------------------
  const handleSave = async () => {
    if (!selectedOrder) return;
    setSaving(true);

    try {
      const updatedOrder =
        selectedOrder.id === 0
          ? await createOrder(selectedOrder)
          : await updateOrder(selectedOrder.id, selectedOrder);

      // -------------------------------
      // Подставляем актуальные остатки
      const updatedWithStock = {
        ...updatedOrder,
        items: updatedOrder.items.map(item => {
          const foundProduct = products.find(p => p.barcode === item.productBarcode);
          return {
            ...item,
            stock: foundProduct?.currentStock ?? 0,
            suggestions: []
          };
        })
      };
      // -------------------------------

      // Обновляем состояние заказов
      setOrders(prev =>
        prev.some(o => o.id === updatedWithStock.id)
          ? prev.map(o => (o.id === updatedWithStock.id ? updatedWithStock : o))
          : [...prev, updatedWithStock]
      );

      // Обновляем выбранный заказ
      setSelectedOrder(updatedWithStock);
    } catch (err) {
      alert("Ошибка при сохранении: " + err.message);
    } finally {
      setSaving(false);
    }
  };



  const handleDelete = async () => {
    if (!selectedOrder) return;
    if (!confirm("Удалить заказ?")) return;

    setSaving(true);

    try {
      await deleteOrder(selectedOrder.id);
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      alert("Ошибка при удалении: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // ФИЛЬТРАЦИЯ + СОРТИРОВКА
  // -------------------------
  const statuses = useMemo(() => [...new Set(orders.map(o => o.status))], [orders]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (filterClient) result = result.filter(o => o.customerInn === filterClient);
    if (filterStatus) result = result.filter(o => o.status === filterStatus);
    if (filterFrom) result = result.filter(o => new Date(o.orderDate) >= new Date(filterFrom));
    if (filterTo) result = result.filter(o => new Date(o.orderDate) <= new Date(filterTo));

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "orderDate") {
        valA = new Date(valA);
        valB = new Date(valB);
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, filterClient, filterStatus, filterFrom, filterTo, sortField, sortOrder]);

  const handleSort = field => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const resetFilters = () => {
    setFilterClient("");
    setFilterStatus("");
    setFilterFrom("");
    setFilterTo("");
  };

  const renderSortIndicator = field =>
    sortField === field ? (sortOrder === "asc" ? " ▲" : " ▼") : null;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Заказы</h1>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div>
          <label className="mr-1">Клиент:</label>
          <select
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Все</option>
            {clients.map(c => (
              <option key={c.inn} value={c.inn}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-1">Статус:</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Все</option>
            {statuses.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-1">С:</label>
          <input
            type="date"
            value={filterFrom}
            onChange={e => setFilterFrom(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="mr-1">По:</label>
          <input
            type="date"
            value={filterTo}
            onChange={e => setFilterTo(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() =>
            setSelectedOrder({
              id: 0,
              customerInn: "",
              customerName: "",
              orderDate: new Date().toISOString().slice(0, 10),
              status: "в_обработке",
              items: []
            })
          }
          className="bg-gray-300 px-3 py-1 rounded"
        >
          + Создать заказ
        </button>

        <button onClick={resetFilters} className="bg-gray-300 px-3 py-1 rounded">
          Сбросить фильтры
        </button>
      </div>

      {/* Таблица заказов */}
      {loading ? (
        <p>Загрузка...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full bg-white border rounded">
          <thead className="bg-gray-200 cursor-pointer">
            <tr>
              <th className="py-2 px-4 border" onClick={() => handleSort("id")}>
                ID {renderSortIndicator("id")}
              </th>
              <th className="py-2 px-4 border" onClick={() => handleSort("customerName")}>
                Клиент {renderSortIndicator("customerName")}
              </th>
              <th className="py-2 px-4 border" onClick={() => handleSort("orderDate")}>
                Дата {renderSortIndicator("orderDate")}
              </th>
              <th className="py-2 px-4 border" onClick={() => handleSort("totalAmount")}>
                Сумма {renderSortIndicator("totalAmount")}
              </th>
              <th className="py-2 px-4 border" onClick={() => handleSort("status")}>
                Статус {renderSortIndicator("status")}
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map(o => (
              <tr
                key={o.id}
                className="text-center hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedOrderWithStock(o)}
              >
                <td className="py-2 px-4 border">{o.id}</td>
                <td className="py-2 px-4 border">{o.customerName}</td>
                <td className="py-2 px-4 border">
                  {new Date(o.orderDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border">{(o.totalAmount ?? 0).toFixed(2)}</td>
                <td className="py-2 px-4 border">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Модалка */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative max-h-[80vh] overflow-auto">
            <button
              className="absolute top-2 right-2"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              Заказ #{selectedOrder.id === 0 ? "новый" : selectedOrder.id}
            </h2>

            {/* Основные поля */}
            <div className="mb-4 flex flex-col gap-2">
              <div>
                <label>Клиент:</label>
                <select
                  value={selectedOrder.customerInn}
                  onChange={e =>
                    setSelectedOrder({
                      ...selectedOrder,
                      customerInn: e.target.value
                    })
                  }
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">Выберите клиента</option>
                  {clients.map(c => (
                    <option key={c.inn} value={c.inn}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Дата:</label>
                <input
                  type="date"
                  value={selectedOrder.orderDate}
                  onChange={e =>
                    setSelectedOrder({
                      ...selectedOrder,
                      orderDate: e.target.value
                    })
                  }
                  className="border rounded px-2 py-1"
                />
              </div>

              <div>
                <label>Статус:</label>
                <select
                  value={selectedOrder.status}
                  onChange={e =>
                    setSelectedOrder({
                      ...selectedOrder,
                      status: e.target.value
                    })
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="в_обработке">в_обработке</option>
                  <option value="подтвержден">подтвержден</option>
                  <option value="оплачен">оплачен</option>
                  <option value="отгружен">отгружен</option>
                  <option value="завершен">завершен</option>
                  <option value="отменен">отменен</option>
                </select>
              </div>
            </div>

            <button onClick={handleAddItem} className="bg-green-200 px-3 py-1 rounded mb-2">
              + Добавить позицию
            </button>

            {/* Таблица товаров */}
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-1 px-2 border">Товар</th>
                  <th className="py-1 px-2 border">Кол-во</th>
                  <th className="py-1 px-2 border">Остаток</th>
                  <th className="py-1 px-2 border">Наценка %</th>
                  <th className="py-1 px-2 border">Цена</th>
                  <th className="py-1 px-2 border">Итог</th>
                  <th className="py-1 px-2 border">Действие</th>
                </tr>
              </thead>

              <tbody>
                {selectedOrder.items.map((item, idx) => (
                  <tr key={idx} className="text-center relative">
                    <td className="py-1 px-2 border relative">
                      <input
                        type="text"
                        value={item.productName}
                        onChange={e => handleProductSearch(idx, e.target.value)}
                        className="border rounded w-full px-1"
                        placeholder="Введите название..."
                      />

                      {/* Подсказки */}
                      {item.suggestions?.length > 0 && (
                        <div className="absolute bg-white border rounded shadow-md z-50 w-full max-h-40 overflow-y-auto">
                          {item.suggestions.map(p => (
                            <div
                              key={p.barcode}
                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-left"
                              onClick={() => handleSelectProduct(idx, p)}
                            >
                              {p.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-1 px-2 border">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e =>
                          handleChangeItem(idx, "quantity", +e.target.value)
                        }
                        className="w-16 border rounded text-center"
                      />
                    </td>
                    <td className="py-1 px-2 border">
                      <input
                        type="number"
                        value={item.stock ?? 0}
                        readOnly
                        className="w-16 border rounded text-center"
                      />
                    </td>
                    <td className="py-1 px-2 border">
                      <input
                        type="number"
                        value={item.markupPercent}
                        onChange={e =>
                          handleChangeItem(idx, "markupPercent", +e.target.value)
                        }
                        className="w-20 border rounded text-center"
                      />
                    </td>

                    <td className="py-1 px-2 border">
                      <input
                        type="number"
                        value={item.priceAtOrder}
                        onChange={e =>
                          handleChangeItem(idx, "priceAtOrder", +e.target.value)
                        }
                        className="w-20 border rounded text-center"
                      />
                    </td>

                    <td className="py-1 px-2 border">
                      {(item.finalPrice ?? 0).toFixed(2)}
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

            {/* Кнопки */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-200 px-4 py-2 rounded"
              >
                Сохранить
              </button>
              <button
                onClick={handleDelete}
                disabled={saving || selectedOrder.id === 0}

                className="bg-red-200 px-4 py-2 rounded"
              >
                Удалить
              </button>
              <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setSelectedOrder(null)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}