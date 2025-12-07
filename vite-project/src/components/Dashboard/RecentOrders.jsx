import React from "react";

export default function RecentOrders({ orders, onClickOrder }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Последние заказы</h2>
        <p className="text-gray-500">Нет последних заказов</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Последние заказы</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-gray-600">ID</th>
              <th className="py-3 px-4 text-left text-gray-600">Клиент</th>
              <th className="py-3 px-4 text-left text-gray-600">Дата</th>
              <th className="py-3 px-4 text-left text-gray-600">Сумма</th>
              <th className="py-3 px-4 text-left text-gray-600">Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b hover:bg-gray-200 cursor-pointer"
                onClick={() => onClickOrder(order)}
              >
                <td className="py-2 px-4">{order.id}</td>
                <td className="py-2 px-4">{order.customerName}</td>
                <td className="py-2 px-4">
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-4">{(order.totalAmount ?? 0).toFixed(2)}</td>
                <td className="py-2 px-4">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}