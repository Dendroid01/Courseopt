import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../Layout/Layout";
import { useOrdersApi } from "../../api/orders";
import { useDeliveriesApi } from "../../api/deliveries";
import { useProductsApi } from "../../api/product";

const TurnoverReport = ({ onBack }) => {
  const { fetchOrders } = useOrdersApi();
  const { fetchDeliveries } = useDeliveriesApi();
  const { fetchProducts } = useProductsApi();

  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [rows, setRows] = useState([]);

  // Фильтры
  const [filterName, setFilterName] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Подсказки по названию
  const [nameSuggestions, setNameSuggestions] = useState([]);

  useEffect(() => {
    Promise.all([fetchOrders(), fetchDeliveries(), fetchProducts()]).then(
      ([o, d, p]) => {
        setOrders(o);
        setDeliveries(d);
        setProducts(p);
      }
    );
  }, []);

  // -------------------------
  // Фильтры и расчёт
  // -------------------------
  const filteredRows = useMemo(() => {
    if (!products.length) return [];

    // фильтруем продажи по дате
    const ordersFiltered = orders.filter(o => {
      const date = new Date(o.orderDate);
      const from = filterDateFrom ? new Date(filterDateFrom) : null;
      const to = filterDateTo ? new Date(filterDateTo) : null;

      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    });

    // фильтруем товары по названию
    const table = products
      .filter(p => p.name.toLowerCase().includes(filterName.toLowerCase()))
      .map(p => {
        // закупки
        const bought = deliveries
          .flatMap(d => d.items)
          .filter(i => i.productBarcode === p.barcode)
          .reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

        // продажи
        const sold = ordersFiltered
          .flatMap(o => o.items)
          .filter(i => i.productBarcode === p.barcode)
          .reduce((sum, i) => sum + i.quantity * i.finalPrice, 0);

        const profit = sold - bought;

        return {
          barcode: p.barcode,
          name: p.name,
          bought: bought.toFixed(2),
          sold: sold.toFixed(2),
          profit: profit.toFixed(2),
        };
      });

    return table;
  }, [products, orders, deliveries, filterName, filterDateFrom, filterDateTo]);

  // -------------------------
  // Подсказки по названию
  // -------------------------
  const handleNameSearch = (text) => {
    setFilterName(text);
    if (!text) setNameSuggestions([]);
    else
      setNameSuggestions(
        products.filter(p => p.name.toLowerCase().includes(text.toLowerCase()))
      );
  };

  const handleSelectName = (name) => {
    setFilterName(name);
    setNameSuggestions([]);
  };

  return (
    <Layout>
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
        ← Назад
      </button>

      <h2 className="text-2xl font-bold mb-4">Оборотная ведомость</h2>

      {/* Фильтры */}
      <div className="flex gap-2 mb-4 items-end">
        <div className="relative">
          <label>Название:</label>
          <input
            type="text"
            value={filterName}
            onChange={e => handleNameSearch(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Введите название..."
          />
          {nameSuggestions.length > 0 && (
            <div className="absolute bg-white border rounded shadow-md z-50 w-full max-h-40 overflow-y-auto">
              {nameSuggestions.map(p => (
                <div
                  key={p.barcode}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-left"
                  onClick={() => handleSelectName(p.name)}
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label>С:</label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={e => setFilterDateFrom(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div>
          <label>По:</label>
          <input
            type="date"
            value={filterDateTo}
            onChange={e => setFilterDateTo(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <button onClick={() => { setFilterName(""); setFilterDateFrom(""); setFilterDateTo(""); }} className="bg-gray-300 px-3 py-1 rounded">
          Сбросить фильтры
        </button>
      </div>

      {/* Таблица */}
      <table className="min-w-full table-auto bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Штрихкод</th>
            <th className="border px-4 py-2">Товар</th>
            <th className="border px-4 py-2">Закуплено, сумма</th>
            <th className="border px-4 py-2">Продано, сумма</th>
            <th className="border px-4 py-2">Прибыль</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map(r => (
            <tr key={r.barcode} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{r.barcode}</td>
              <td className="border px-4 py-2">{r.name}</td>
              <td className="border px-4 py-2">{r.bought}</td>
              <td className="border px-4 py-2">{r.sold}</td>
              <td className="border px-4 py-2">{r.profit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default TurnoverReport;