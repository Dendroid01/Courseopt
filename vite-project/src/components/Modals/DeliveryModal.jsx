import React from "react";

export default function DeliveryModal({
  delivery,
  suppliers,
  products,
  saving,
  onClose,
  onSave,
  onDelete,
  onAddItem,
  onChangeItem,
  onSearchProduct,
  onSelectProduct
}) {
  if (!delivery) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative max-h-[80vh] overflow-auto">

        {/* Close */}
        <button className="absolute top-2 right-2" onClick={onClose}>✕</button>

        <h2 className="text-xl font-bold mb-4">
          Поставка #{delivery.id === 0 ? "новая" : delivery.id}
        </h2>

        {/* ===== Общая информация ===== */}
        <div className="mb-4 flex flex-col gap-2">
          <div>
            <label>Поставщик:</label>
            <select
              value={delivery.supplierInn}
              onChange={(e) =>
                onChangeItem("supplierInn", e.target.value)
              }
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Выберите поставщика</option>
              {suppliers.map((s) => (
                <option key={s.inn} value={s.inn}>
                  {s.companyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Дата:</label>
            <input
              type="date"
              value={delivery.deliveryDate}
              onChange={(e) =>
                onChangeItem("deliveryDate", e.target.value)
              }
              className="border rounded px-2 py-1"
            />
          </div>

          <div>
            <label>Статус:</label>
            <select
              value={delivery.status}
              onChange={(e) =>
                onChangeItem("status", e.target.value)
              }
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

        {/* ===== Добавить позицию ===== */}
        <button
          onClick={onAddItem}
          className="bg-green-200 px-3 py-1 rounded mb-2"
        >
          + Добавить позицию
        </button>

        {/* ===== Таблица позиций ===== */}
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-1 px-2 border">Товар</th>
              <th className="py-1 px-2 border">Кол-во</th>
              <th className="py-1 px-2 border">Цена</th>
              <th className="py-1 px-2 border">Дата производства</th>
              <th className="py-1 px-2 border">Срок годности</th>
            </tr>
          </thead>
          <tbody>
            {delivery.items.map((item, idx) => (
              <tr key={idx} className="text-center relative">

                {/* ===== Товар / автоподсказка ===== */}
                <td className="py-1 px-2 border relative">
                  <input
                    type="text"
                    value={item.productName ?? ""}
                    onChange={(e) => onSearchProduct(idx, e.target.value)}
                    className="border rounded w-full px-1"
                    placeholder="Введите название"
                  />

                  {item.suggestions?.length > 0 && (
                    <div className="absolute bg-white border rounded shadow-md z-50 w-full max-h-40 overflow-y-auto">
                      {item.suggestions.map((p) => (
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
                    value={item.quantity}
                    onChange={(e) =>
                      onChangeItem(idx, "quantity", +e.target.value)
                    }
                    className="w-16 border rounded text-center"
                  />
                </td>

                {/* Цена */}
                <td className="py-1 px-2 border">
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      onChangeItem(idx, "unitPrice", +e.target.value)
                    }
                    className="w-20 border rounded text-center"
                  />
                </td>

                {/* Дата производства */}
                <td className="py-1 px-2 border">
                  <input
                    type="date"
                    value={item.productionDate ?? ""}
                    onChange={(e) =>
                      onChangeItem(idx, "productionDate", e.target.value)
                    }
                    className="border rounded w-32 px-1"
                  />
                </td>

                {/* Срок годности (readOnly) */}
                <td className="py-1 px-2 border">
                  <input
                    type="date"
                    value={item.expirationDate ?? ""}
                    readOnly
                    className="border rounded w-32 px-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== Кнопки управления ===== */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-blue-200 px-4 py-2 rounded"
          >
            Сохранить
          </button>

          <button
            onClick={onDelete}
            disabled={saving || delivery.id === 0}
            className="bg-red-200 px-4 py-2 rounded"
          >
            Удалить
          </button>

          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}