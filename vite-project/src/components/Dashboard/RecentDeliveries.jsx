import React from "react";

export default function RecentDeliveries({ deliveries, onClickDelivery }) {
  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Последние поставки</h2>
        <p className="text-gray-500">Нет последних поставок</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Последние поставки</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-gray-600">ID</th>
              <th className="py-3 px-4 text-left text-gray-600">Поставщик</th>
              <th className="py-3 px-4 text-left text-gray-600">Дата</th>
              <th className="py-3 px-4 text-left text-gray-600">Сумма</th>
              <th className="py-3 px-4 text-left text-gray-600">Статус</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => (
              <tr
                key={delivery.id}
                className="border-b hover:bg-gray-200 cursor-pointer"
                onClick={() => onClickDelivery(delivery)}
              >
                <td className="py-2 px-4">{delivery.id}</td>
                <td className="py-2 px-4">{delivery.supplierName}</td>
                <td className="py-2 px-4">{new Date(delivery.deliveryDate).toLocaleDateString()}</td>
                <td className="py-2 px-4">{(delivery.totalAmount ?? 0).toFixed(2)}</td>
                <td className="py-2 px-4">{delivery.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}