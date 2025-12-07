import { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import { fetchCustomers } from "../api/customers";

export default function Customers() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchCustomers().then(setItems);
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Клиенты</h1>

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
          {items.map(c => (
            <tr key={c.inn} className="text-center">
              <td className="py-2 px-4 border">{c.inn}</td>
              <td className="py-2 px-4 border">{c.companyName}</td>
              <td className="py-2 px-4 border">{c.city}</td>
              <td className="py-2 px-4 border">{c.mobilePhone}</td>
              <td className="py-2 px-4 border">{c.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
