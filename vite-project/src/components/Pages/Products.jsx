import { useEffect, useState, useMemo } from "react";
import Layout from "../Layout/Layout";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "../api/product";

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Фильтры
  const [filterName, setFilterName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterUnit, setFilterUnit] = useState("");

  // Сортировка
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Автоподсказки по названию
  // -------------------------
  const [nameSuggestions, setNameSuggestions] = useState([]);

  const handleNameSearch = (text) => {
    setFilterName(text);
    if (!text) {
      setNameSuggestions([]);
    } else {
      setNameSuggestions(
        items.filter(p => p.name.toLowerCase().includes(text.toLowerCase()))
      );
    }
  };

  const handleSelectName = (name) => {
    setFilterName(name);
    setNameSuggestions([]);
  };

  // -------------------------
  // Фильтры + сортировка
  // -------------------------
  const categories = useMemo(() => [...new Set(items.map(p => p.category))], [items]);
  const units = useMemo(() => [...new Set(items.map(p => p.unit))], [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (filterName) result = result.filter(p => p.name.toLowerCase().includes(filterName.toLowerCase()));
    if (filterCategory) result = result.filter(p => p.category === filterCategory);
    if (filterUnit) result = result.filter(p => p.unit === filterUnit);

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, filterName, filterCategory, filterUnit, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortIndicator = field =>
    sortField === field ? (sortOrder === "asc" ? " ▲" : " ▼") : null;

  const resetFilters = () => {
    setFilterName("");
    setFilterCategory("");
    setFilterUnit("");
  };

  // -------------------------
  // Модалка создания/редактирования
  // -------------------------
  const handleSave = async () => {
    if (!selectedItem) return;
    setSaving(true);
    try {
      const updated =
        selectedItem.existing ? await updateProduct(selectedItem.barcode, selectedItem)
          : await createProduct(selectedItem);

      await loadProducts();
      setSelectedItem(null);
    } catch (err) {
      alert("Ошибка при сохранении: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !selectedItem.barcode) return;
    if (!confirm("Удалить товар?")) return;
    setSaving(true);
    try {
      await deleteProduct(selectedItem.barcode);
      loadProducts();
      setSelectedItem(null);
    } catch (err) {
      alert("Ошибка при удалении: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Товары на складе</h1>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-2 items-end">
        <div className="relative">
          <label className="mr-1">Название:</label>
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
          <label className="mr-1">Категория:</label>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Все</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-1">Ед. измерения:</label>
          <select
            value={filterUnit}
            onChange={e => setFilterUnit(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Все</option>
            {units.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Кнопки на отдельной строке */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedItem({ barcode: "", name: "", category: "", unit: "", unitPrice: 0, storageDays: 0, currentStock: 0, isNew: true })}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          + Создать товар
        </button>

        <button onClick={resetFilters} className="bg-gray-300 px-3 py-1 rounded">
          Сбросить фильтры
        </button>
      </div>


      {/* Таблица */}
      {loading ? <p>Загрузка...</p> : error ? <p className="text-red-500">{error}</p> : (
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-200 cursor-pointer">
            <tr>
              <th className="py-2 px-4 border" onClick={() => handleSort("barcode")}>
                Штрихкод {renderSortIndicator("barcode")}
              </th>
              <th className="py-2 px-4 border" onClick={() => handleSort("name")}>
                Название {renderSortIndicator("name")}
              </th>
              <th className="py-2 px-4 border" onClick={() => handleSort("category")}>
                Категория {renderSortIndicator("category")}
              </th>
              <th className="py-2 px-4 border" onClick={() => handleSort("unitPrice")}>
                Цена {renderSortIndicator("unitPrice")}
              </th>
              <th className="py-2 px-4 border" onClick={() => handleSort("storageDays")}>
                Срок хранения {renderSortIndicator("storageDays")}
              </th>
              <th className="py-2 px-4 border" onClick={() => handleSort("unit")}>
                Ед. {renderSortIndicator("unit")}
              </th>
              <th className="py-2 px-4 border" onClick={() => handleSort("currentStock")}>
                Остаток {renderSortIndicator("currentStock")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(p => (
              <tr
                key={p.barcode}
                className="text-center hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedItem(p)}
              >
                <td className="py-2 px-4 border">{p.barcode}</td>
                <td className="py-2 px-4 border">{p.name}</td>
                <td className="py-2 px-4 border">{p.category}</td>
                <td className="py-2 px-4 border">{p.unitPrice.toFixed(2)}</td>
                <td className="py-2 px-4 border">{p.storageDays}</td>
                <td className="py-2 px-4 border">{p.unit}</td>
                <td className="py-2 px-4 border">{p.currentStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Модалка */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative max-h-[80vh] overflow-auto">
            <button
              className="absolute top-2 right-2"
              onClick={() => setSelectedItem(null)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              Товар: {selectedItem.barcode || "новый"}
            </h2>

            <div className="mb-4 flex flex-col gap-2">
              <div>
                <label>Штрихкод:</label>
                <input
                  type="text"
                  value={selectedItem.barcode}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 50); // только цифры, максимум 50
                    setSelectedItem({ ...selectedItem, barcode: value });
                  }}
                  className="border rounded px-2 py-1 w-full"
                  disabled={!selectedItem.isNew} // блокируем только если это не новый товар
                  placeholder="Только цифры, максимум 50"
                />
              </div>


              <div>
                <label>Название:</label>
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={e => setSelectedItem({ ...selectedItem, name: e.target.value })}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              <div>
                <label>Категория:</label>
                <select
                  value={selectedItem.category}
                  onChange={e => setSelectedItem({ ...selectedItem, category: e.target.value })}
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Ед. измерения:</label>
                <select
                  value={selectedItem.unit}
                  onChange={e => setSelectedItem({ ...selectedItem, unit: e.target.value })}
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">Выберите единицу</option>
                  {units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>


              <div>
                <label>Цена:</label>
                <input
                  type="number"
                  value={selectedItem.unitPrice}
                  onChange={e => setSelectedItem({ ...selectedItem, unitPrice: +e.target.value })}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              <div>
                <label>Срок хранения:</label>
                <input
                  type="number"
                  value={selectedItem.storageDays}
                  onChange={e => setSelectedItem({ ...selectedItem, storageDays: +e.target.value })}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-200 px-4 py-2 rounded"
              >
                Сохранить
              </button>
              {selectedItem.barcode && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="bg-red-200 px-4 py-2 rounded"
                >
                  Удалить
                </button>
              )}
              <button
                className="bg-gray-200 px-4 py-2 rounded"
                onClick={() => setSelectedItem(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}