import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../Layout/Layout";
import { useOrdersApi } from "../../api/orders";
import { useProductsApi } from "../../api/product";
import { useCustomersApi } from "../../api/customers";

const CustomerInteractionReport = ({ onBack }) => {
  const { fetchOrders } = useOrdersApi();
  const { fetchProducts } = useProductsApi();
  const { fetchCustomers } = useCustomersApi();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);

  // Фильтры
  const [filterClient, setFilterClient] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);

  useEffect(() => {
    Promise.all([fetchOrders(), fetchProducts(), fetchCustomers()]).then(
      ([o, p, c]) => {
        setOrders(o);
        setProducts(p);
        setClients(c);
      }
    );
  }, []);

  // -------------------------
  // Фильтры и расчёт таблицы
  // -------------------------
  const filteredRows = useMemo(() => {
    if (!orders.length) return [];

    const ordersFiltered = orders.filter(o => {
      const date = new Date(o.orderDate);
      const from = filterDateFrom ? new Date(filterDateFrom) : null;
      const to = filterDateTo ? new Date(filterDateTo) : null;

      if (from && date < from) return false;
      if (to && date > to) return false;

      if (filterClient) {
        const client = clients.find(c => c.inn === o.customerInn);
        if (!client || !client.companyName.toLowerCase().includes(filterClient.toLowerCase())) return false;
      }

      return true;
    });

    const table = {};

    ordersFiltered.forEach(o => {
      const client = clients.find(c => c.inn === o.customerInn);
      const clientName = client ? client.companyName : "Неизвестный клиент";

      o.items.forEach(item => {
        if (filterProduct && !item.productName.toLowerCase().includes(filterProduct.toLowerCase())) return;

        const key = `${o.customerInn}_${item.productBarcode}`;
        if (!table[key]) table[key] = { client: clientName, product: item.productName, quantity: 0, revenue: 0, cogs: 0 };

        table[key].quantity += item.quantity;
        table[key].revenue += item.quantity * item.finalPrice;
        table[key].cogs += item.quantity * item.priceAtOrder;
      });
    });

    return Object.values(table).map(row => ({
      ...row,
      profit: (row.revenue - row.cogs).toFixed(2),
      revenue: row.revenue.toFixed(2),
      cogs: row.cogs.toFixed(2),
    }));
  }, [orders, clients, filterClient, filterProduct, filterDateFrom, filterDateTo]);

  // -------------------------
  // Подсказки для фильтров
  // -------------------------
  const handleClientSearch = text => {
    setFilterClient(text);
    const names = clients.map(c => c.companyName);
    setClientSuggestions(names.filter(n => n.toLowerCase().includes(text.toLowerCase())));
  };

  const handleSelectClient = name => {
    setFilterClient(name);
    setClientSuggestions([]);
  };

  const handleProductSearch = text => {
    setFilterProduct(text);
    setProductSuggestions(products.filter(p => p.name.toLowerCase().includes(text.toLowerCase())));
  };

  const handleSelectProduct = name => {
    setFilterProduct(name);
    setProductSuggestions([]);
  };

  return (
    <Layout>
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
        ← Назад
      </button>
      <h2 className="text-2xl font-bold mb-4">Взаимодействие с клиентами</h2>

      {/* Фильтры */}
      <div className="flex gap-2 mb-4 items-end">
        <div className="relative">
          <label>Клиент:</label>
          <input
            type="text"
            value={filterClient}
            onChange={e => handleClientSearch(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Введите имя клиента..."
          />
          {clientSuggestions.length > 0 && (
            <div className="absolute bg-white border rounded shadow-md z-50 w-full max-h-40 overflow-y-auto">
              {clientSuggestions.map(c => (
                <div
                  key={c}
                  onClick={() => handleSelectClient(c)}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label>Товар:</label>
          <input
            type="text"
            value={filterProduct}
            onChange={e => handleProductSearch(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Введите название товара..."
          />
          {productSuggestions.length > 0 && (
            <div className="absolute bg-white border rounded shadow-md z-50 w-full max-h-40 overflow-y-auto">
              {productSuggestions.map(p => (
                <div
                  key={p.barcode}
                  onClick={() => handleSelectProduct(p.name)}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
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

        <button
          onClick={() => {
            setFilterClient("");
            setFilterProduct("");
            setFilterDateFrom("");
            setFilterDateTo("");
          }}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          Сбросить фильтры
        </button>
      </div>

      {/* Таблица */}
      <table className="min-w-full table-auto bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Клиент</th>
            <th className="border px-4 py-2">Товар</th>
            <th className="border px-4 py-2">Количество</th>
            <th className="border px-4 py-2">Выручка</th>
            <th className="border px-4 py-2">Себестоимость</th>
            <th className="border px-4 py-2">Прибыль</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map(r => (
            <tr key={r.client + r.product} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{r.client}</td>
              <td className="border px-4 py-2">{r.product}</td>
              <td className="border px-4 py-2">{r.quantity}</td>
              <td className="border px-4 py-2">{r.revenue}</td>
              <td className="border px-4 py-2">{r.cogs}</td>
              <td className="border px-4 py-2">{r.profit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default CustomerInteractionReport;