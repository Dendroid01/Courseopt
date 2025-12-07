import { useEffect, useState } from "react";
import Layout from "../Layout/Layout.jsx";
import { fetchSuppliers } from "../api/suppliers";

export default function Suppliers() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchSuppliers().then(setItems);
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Поставщики</h1>

      <table className="min-w-full bg-white border">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 border">ИНН</th>
            <th className="py-2 px-4 border">Компания</th>
            <th className="py-2 px-4 border">Город</th>
            <th className="py-2 px-4 border">Контакт</th>
            <th className="py-2 px-4 border">Email</th>
          </tr>
        </thead>
        <tbody>
          {items.map(s => (
            <tr key={s.inn} className="text-center">
              <td className="py-2 px-4 border">{s.inn}</td>
              <td className="py-2 px-4 border">{s.companyName}</td>
              <td className="py-2 px-4 border">{s.city}</td>
              <td className="py-2 px-4 border">{s.mobilePhone}</td>
              <td className="py-2 px-4 border">{s.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}