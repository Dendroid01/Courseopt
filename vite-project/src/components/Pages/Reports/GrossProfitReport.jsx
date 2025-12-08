import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../Layout/Layout";
import { useOrdersApi } from "../../api/orders";
import { useDeliveriesApi } from "../../api/deliveries";
import { useProductsApi } from "../../api/product";

const GrossProfitByProductReport = ({ onBack }) => {
  const { fetchOrders } = useOrdersApi();
  const { fetchDeliveries } = useDeliveriesApi();
  const { fetchProducts } = useProductsApi();

  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);

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
  // Подсказки по названию
  // -------------------------
  const handleNameSearch = (text) => {
    setFilterName(text);
    if (!text) setNameSuggestions([]);
    else
      setNameSuggestions(
        products.filter(p =>
          p.name.toLowerCase().includes(text.toLowerCase())
        )
      );
  };

  const handleSelectName = (name) => {
    setFilterName(name);
    setNameSuggestions([]);
  };

  const resetFilters = () => {
    setFilterName("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setNameSuggestions([]);
  };

  // -------------------------
  // Расчёт таблицы с фильтрацией
  // -------------------------
  const filteredRows = useMemo(() => {
    if (!products.length) return [];

    // Фильтруем продажи по дате
    const ordersFiltered = orders.filter(o => {
      const date = new Date(o.orderDate);
      const from = filterDateFrom ? new Date(filterDateFrom) : null;
      const to = filterDateTo ? new Date(filterDateTo) : null;
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    });

    return products
      .filter(p => p.name.toLowerCase().includes(filterName.toLowerCase()))
      .map(p => {
        // Закупки
        const bought = deliveries
          .flatMap(d => d.items)
          .filter(i => i.productBarcode === p.barcode)
          .reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

        // Продажи
        const sold = ordersFiltered
          .flatMap(o => o.items)
          .filter(i => i.productBarcode === p.barcode)
          .reduce((sum, i) => sum + i.quantity * i.finalPrice, 0);

        const profit = sold - bought;
        const margin = sold ? ((profit / sold) * 100).toFixed(2) : "0";

        return {
          barcode: p.barcode,
          name: p.name,
          revenue: sold.toFixed(2),
          cogs: bought.toFixed(2),
          profit: profit.toFixed(2),
          margin,
        };
      });
  }, [products, orders, deliveries, filterName, filterDateFrom, filterDateTo]);

  return (
    <Layout>
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
        ← Назад
      </button>

      <h2 className="text-2xl font-bold mb-4">Валовая прибыль по товарам</h2>

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

        <button onClick={resetFilters} className="bg-gray-300 px-3 py-1 rounded">
          Сбросить фильтры
        </button>
      </div>

      {/* Таблица */}
      <table className="min-w-full table-auto bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Штрихкод</th>
            <th className="border px-4 py-2">Товар</th>
            <th className="border px-4 py-2">Выручка</th>
            <th className="border px-4 py-2">Себестоимость</th>
            <th className="border px-4 py-2">Валовая прибыль</th>
            <th className="border px-4 py-2">Маржа (%)</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map(r => (
            <tr key={r.barcode} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{r.barcode}</td>
              <td className="border px-4 py-2">{r.name}</td>
              <td className="border px-4 py-2">{r.revenue}</td>
              <td className="border px-4 py-2">{r.cogs}</td>
              <td className="border px-4 py-2">{r.profit}</td>
              <td className="border px-4 py-2">{r.margin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default GrossProfitByProductReport;