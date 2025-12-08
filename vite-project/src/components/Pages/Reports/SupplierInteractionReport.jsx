import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../Layout/Layout";
import { useDeliveriesApi } from "../../api/deliveries";
import { useProductsApi } from "../../api/product";
import { useSuppliersApi } from "../../api/suppliers";

const SupplierInteractionReport = ({ onBack }) => {
  const { fetchDeliveries } = useDeliveriesApi();
  const { fetchProducts } = useProductsApi();
  const { fetchSuppliers } = useSuppliersApi();

  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);

  useEffect(() => {
    Promise.all([fetchDeliveries(), fetchProducts(), fetchSuppliers()]).then(
      ([d, p, s]) => {
        setDeliveries(d);
        setProducts(p);
        setSuppliers(s);
      }
    );
  }, []);

  const filteredRows = useMemo(() => {
    if (!deliveries.length) return [];

    const deliveriesFiltered = deliveries.filter((d) => {
      const date = new Date(d.date);
      const from = filterDateFrom ? new Date(filterDateFrom) : null;
      const to = filterDateTo ? new Date(filterDateTo) : null;

      if (from && date < from) return false;
      if (to && date > to) return false;

      if (filterSupplier) {
        const supplier = suppliers.find(
          (s) => s.companyName === d.supplierName
        );
        const name = supplier?.companyName ?? "";
        if (!name.toLowerCase().includes(filterSupplier.toLowerCase()))
          return false;
      }

      return true;
    });

    const table = {};

    deliveriesFiltered.forEach((d) => {
      d.items.forEach((item) => {
        if (
          filterProduct &&
          !item.productName?.toLowerCase().includes(filterProduct.toLowerCase())
        )
          return;

        const supplier = suppliers.find(
          (s) => s.companyName === d.supplierName
        );
        const supplierName = supplier?.companyName ?? "Неизвестный поставщик";
        const key = `${supplierName}_${item.productBarcode}`;

        if (!table[key])
          table[key] = { supplier: supplierName, product: item.productName, quantity: 0, total: 0 };

        table[key].quantity += item.quantity;
        table[key].total += item.quantity * item.unitPrice;
      });
    });

    return Object.values(table).map((row) => ({
      ...row,
      total: row.total.toFixed(2),
    }));
  }, [deliveries, suppliers, filterSupplier, filterProduct, filterDateFrom, filterDateTo]);

  const handleSupplierSearch = (text) => {
    setFilterSupplier(text);
    const names = suppliers.map((s) => s.companyName).filter(Boolean);
    setSupplierSuggestions(
      names.filter((n) => n.toLowerCase().includes(text.toLowerCase()))
    );
  };

  const handleSelectSupplier = (name) => {
    setFilterSupplier(name);
    setSupplierSuggestions([]);
  };

  const handleProductSearch = (text) => {
    setFilterProduct(text);
    setProductSuggestions(
      products.filter((p) => p.name?.toLowerCase().includes(text.toLowerCase()))
    );
  };

  const handleSelectProduct = (name) => {
    setFilterProduct(name);
    setProductSuggestions([]);
  };

  return (
    <Layout>
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">← Назад</button>
      <h2 className="text-2xl font-bold mb-4">Взаимодействие с поставщиками</h2>

      <div className="flex gap-2 mb-4 items-end">
        <div className="relative">
          <label>Поставщик:</label>
          <input
            type="text"
            value={filterSupplier}
            onChange={(e) => handleSupplierSearch(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Введите имя поставщика..."
          />
          {supplierSuggestions.length > 0 && (
            <div className="absolute bg-white border rounded shadow-md z-50 w-full max-h-40 overflow-y-auto">
              {supplierSuggestions.map((s) => (
                <div
                  key={s}
                  onClick={() => handleSelectSupplier(s)}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  {s}
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
            onChange={(e) => handleProductSearch(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Введите название товара..."
          />
          {productSuggestions.length > 0 && (
            <div className="absolute bg-white border rounded shadow-md z-50 w-full max-h-40 overflow-y-auto">
              {productSuggestions.map((p) => (
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
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div>
          <label>По:</label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <button
          onClick={() => {
            setFilterSupplier("");
            setFilterProduct("");
            setFilterDateFrom("");
            setFilterDateTo("");
          }}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          Сбросить фильтры
        </button>
      </div>

      <table className="min-w-full table-auto bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Поставщик</th>
            <th className="border px-4 py-2">Товар</th>
            <th className="border px-4 py-2">Количество</th>
            <th className="border px-4 py-2">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((r) => (
            <tr key={r.supplier + r.product} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{r.supplier}</td>
              <td className="border px-4 py-2">{r.product}</td>
              <td className="border px-4 py-2">{r.quantity}</td>
              <td className="border px-4 py-2">{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default SupplierInteractionReport;