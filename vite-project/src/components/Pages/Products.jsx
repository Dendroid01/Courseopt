import { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import { fetchProducts } from "../api/product";

export default function Products() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchProducts().then(setItems);
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Товары на складе</h1>

      <table className="min-w-full bg-white border">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 border">Штрихкод</th>
            <th className="py-2 px-4 border">Название</th>
            <th className="py-2 px-4 border">Категория</th>
            <th className="py-2 px-4 border">Цена</th>
            <th className="py-2 px-4 border">Срок хранения</th>
            <th className="py-2 px-4 border">Ед.</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.barcode} className="text-center">
              <td className="py-2 px-4 border">{p.barcode}</td>
              <td className="py-2 px-4 border">{p.name}</td>
              <td className="py-2 px-4 border">{p.category}</td>
              <td className="py-2 px-4 border">{p.unitPrice.toFixed(2)}</td>
              <td className="py-2 px-4 border">{p.storageDays}</td>
              <td className="py-2 px-4 border">{p.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
