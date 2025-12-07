import React from "react";

export default function OrderModal({
  order,
  clients = [],
  products = [],
  onClose,
  onSave,
  onDelete,
  onDeleteItem,
  onAddItem,
  onChangeItem,
  onSearchProduct,
  onSelectProduct,
  onChangeOrderField,
  saving = false
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative max-h-[80vh] overflow-auto">
        
        {/* Закрыть */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">
          Заказ #{order.id || "новый"}
        </h2>

        {/* Основные поля */}
        <div className="mb-4 flex flex-col gap-2">
          {/* Клиент */}
          <div>
            <label className="font-semibold">Клиент:</label>
            <select
              value={order.customerInn || ""}
              onChange={e => {
                const clientInn = e.target.value;
                const client = clients.find(c => c.inn === clientInn);
                onChangeOrderField("customerInn", clientInn);
                onChangeOrderField("customerName", client?.companyName || "");
              }}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Выберите клиента</option>
              {clients.map(c => (
                <option key={c.inn} value={c.inn}>{c.companyName}</option>
              ))}
            </select>
          </div>

          {/* Дата */}
          <div>
            <label className="font-semibold">Дата:</label>
            <input
              type="date"
              value={order.orderDate ? order.orderDate.slice(0, 10) : ""}
              onChange={e => onChangeOrderField("orderDate", e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>

          {/* Статус */}
          <div>
            <label className="font-semibold">Статус:</label>
            <select
              value={order.status || "в_обработке"}
              onChange={e => onChangeOrderField("status", e.target.value)}
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

        {/* Добавить позицию */}
        <button
          onClick={onAddItem}
          className="bg-green-200 px-3 py-1 rounded mb-2"
        >
          + Добавить позицию
        </button>

        {/* Таблица товаров */}
        <h3 className="mt-4 font-semibold mb-2">Товары</h3>
        <table className="min-w-full border mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-1 px-2 border">Название</th>
              <th className="py-1 px-2 border">Количество</th>
              <th className="py-1 px-2 border">Остаток</th>
              <th className="py-1 px-2 border">Наценка (%)</th>
              <th className="py-1 px-2 border">Цена</th>
              <th className="py-1 px-2 border">Итоговая цена</th>
              <th className="py-1 px-2 border">Действие</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx} className="text-center relative">
                {/* Название и автоподсказка */}
                <td className="py-1 px-2 border relative">
                  <input
                    type="text"
                    value={item.productName || ""}
                    onChange={e => onSearchProduct(idx, e.target.value)}
                    className="border rounded w-full px-1"
                    placeholder="Введите название..."
                  />
                  {item.suggestions?.length > 0 && (
                    <div className="absolute bg-white border rounded shadow-md z-50 w-full max-h-40 overflow-y-auto">
                      {item.suggestions.map(p => (
                        <div
                          key={p.barcode}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-left"
                          onClick={() => onSelectProduct(idx, p)}
                        >
                          {p.name}
                        </div>
                      ))}
                    </div>
                  )}
                </td>

                {/* Количество */}
                <td className="py-1 px-2 border">
                  <input
                    type="number"
                    value={item.quantity ?? 1}
                    onChange={e => {
                      let value = +e.target.value;
                      if (value > (item.stock ?? 0)) value = item.stock ?? 0;
                      onChangeItem(idx, "quantity", value);
                    }}
                    className="w-16 text-center border rounded"
                    min={0}
                    max={item.stock ?? 0}
                  />
                </td>

                {/* Остаток */}
                <td className="py-1 px-2 border">
                  <input
                    type="number"
                    value={item.stock ?? 0}
                    readOnly
                    className="w-16 text-center border rounded bg-gray-100"
                  />
                </td>

                {/* Наценка */}
                <td className="py-1 px-2 border">
                  <input
                    type="number"
                    value={item.markupPercent ?? 0}
                    onChange={e => onChangeItem(idx, "markupPercent", +e.target.value)}
                    className="w-20 text-center border rounded"
                  />
                </td>

                {/* Цена */}
                <td className="py-1 px-2 border">
                  <input
                    type="number"
                    value={item.priceAtOrder ?? 0}
                    onChange={e => onChangeItem(idx, "priceAtOrder", +e.target.value)}
                    className="w-20 text-center border rounded"
                  />
                </td>

                {/* Итоговая цена */}
                <td className="py-1 px-2 border">
                  {(item.finalPrice ?? 0).toFixed(2)}
                </td>
                <td className="py-1 px-2 border">
                      <button
                        onClick={() => onDeleteItem(item.productBarcode)}
                        className="text-red-500 font-bold hover:text-red-700"
                      >
                        ✕
                      </button>
                    </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Кнопки управления */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-blue-200 text-black px-4 py-2 rounded disabled:opacity-50"
          >
            Сохранить
          </button>
          <button
            onClick={onDelete}
            disabled={saving}
            className="bg-red-200 text-black px-4 py-2 rounded disabled:opacity-50"
          >
            Удалить
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 text-black px-4 py-2 rounded"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}