import { useEffect, useState, useMemo } from "react";
import Layout from "../Layout/Layout.jsx";
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../api/suppliers";

export default function Suppliers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Фильтры
  const [filterCompany, setFilterCompany] = useState("");
  const [filterCity, setFilterCity] = useState("");

  // Сортировка
  const [sortField, setSortField] = useState("companyName");
  const [sortOrder, setSortOrder] = useState("asc");

  // Автоподсказки по компании
  const [companySuggestions, setCompanySuggestions] = useState([]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await fetchSuppliers();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySearch = (text) => {
    setFilterCompany(text);
    if (!text) {
      setCompanySuggestions([]);
    } else {
      setCompanySuggestions(
        items.filter(s => s.companyName.toLowerCase().includes(text.toLowerCase()))
      );
    }
  };

  const handleSelectCompany = (name) => {
    setFilterCompany(name);
    setCompanySuggestions([]);
  };

  const cities = useMemo(() => [...new Set(items.map(s => s.city).filter(Boolean))], [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (filterCompany) result = result.filter(s => s.companyName.toLowerCase().includes(filterCompany.toLowerCase()));
    if (filterCity) result = result.filter(s => s.city === filterCity);

    result.sort((a, b) => {
      let valA = a[sortField] ?? "";
      let valB = b[sortField] ?? "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, filterCompany, filterCity, sortField, sortOrder]);

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
    setFilterCompany("");
    setFilterCity("");
  };

  // -------------------------
  // Модалка редактирования/создания
  // -------------------------
  const handleSave = async () => {
    if (!selectedSupplier?.inn) {
      alert("ИНН обязателен");
      return;
    }

    setSaving(true);
    try {
      if (selectedSupplier.isNew) {
        await createSupplier(selectedSupplier);
      } else {
        await updateSupplier(selectedSupplier.inn, selectedSupplier);
      }
      await loadSuppliers();
      setSelectedSupplier(null);
    } catch (err) {
      alert("Ошибка при сохранении: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier?.inn) return;
    if (!confirm("Удалить поставщика?")) return;
    setSaving(true);
    try {
      await deleteSupplier(selectedSupplier.inn);
      await loadSuppliers();
      setSelectedSupplier(null);
    } catch (err) {
      alert("Ошибка при удалении: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Поставщики</h1>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-2 items-end">
        <div className="relative">
          <label className="mr-1">Компания:</label>
          <input
            type="text"
            value={filterCompany}
            onChange={e => handleCompanySearch(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Введите компанию..."
          />
          {companySuggestions.length > 0 && (
            <div className="absolute bg-white border rounded shadow-md z-50 w-full max-h-40 overflow-y-auto">
              {companySuggestions.map(s => (
                <div
                  key={s.inn}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-left"
                  onClick={() => handleSelectCompany(s.companyName)}
                >
                  {s.companyName}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mr-1">Город:</label>
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Все</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedSupplier({
            inn: "",
            companyName: "",
            contactPerson: "",
            mobilePhone: "",
            email: "",
            city: "",
            isNew: true
          })}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          + Создать поставщика
        </button>
        <button onClick={resetFilters} className="bg-gray-300 px-3 py-1 rounded">
          Сбросить фильтры
        </button>
      </div>

      {/* Таблица */}
      {
        loading ? <p>Загрузка...</p> : error ? <p className="text-red-500">{error}</p> : (
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-200 cursor-pointer">
              <tr>
                <th className="py-2 px-4 border" onClick={() => handleSort("inn")}>ИНН {renderSortIndicator("inn")}</th>
                <th className="py-2 px-4 border" onClick={() => handleSort("companyName")}>Компания {renderSortIndicator("companyName")}</th>
                <th className="py-2 px-4 border" onClick={() => handleSort("city")}>Город {renderSortIndicator("city")}</th>
                <th className="py-2 px-4 border" onClick={() => handleSort("mobilePhone")}>Телефон {renderSortIndicator("mobilePhone")}</th>
                <th className="py-2 px-4 border" onClick={() => handleSort("email")}>Email {renderSortIndicator("email")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(s => (
                <tr
                  key={s.inn}
                  className="text-center hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedSupplier(s)}
                >
                  <td className="py-2 px-4 border">{s.inn}</td>
                  <td className="py-2 px-4 border">{s.companyName}</td>
                  <td className="py-2 px-4 border">{s.city}</td>
                  <td className="py-2 px-4 border">{s.mobilePhone}</td>
                  <td className="py-2 px-4 border">{s.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }

      {/* Модалка */}
      {
        selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative max-h-[80vh] overflow-auto">
              <button className="absolute top-2 right-2" onClick={() => setSelectedSupplier(null)}>✕</button>
              <h2 className="text-xl font-bold mb-4">{selectedSupplier.isNew ? "Создать" : "Редактировать"} поставщика</h2>

              <div className="flex flex-col gap-2">
                {/* INN */}
                <div>
                  <label>ИНН*:</label>
                  <input
                    type="text"
                    value={selectedSupplier.inn}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setSelectedSupplier({ ...selectedSupplier, inn: val });
                    }}
                    className="border rounded px-2 py-1 w-full"
                    disabled={!selectedSupplier.isNew}
                    required
                  />
                </div>

                {/* CompanyName */}
                <div>
                  <label>Компания*:</label>
                  <input
                    type="text"
                    value={selectedSupplier.companyName}
                    onChange={e => setSelectedSupplier({ ...selectedSupplier, companyName: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                    required
                  />
                </div>

                {/* ContactPerson */}
                <div>
                  <label>Контактное лицо:</label>
                  <input
                    type="text"
                    value={selectedSupplier.contactPerson || ""}
                    onChange={e => setSelectedSupplier({ ...selectedSupplier, contactPerson: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>

                {/* City */}
                <div>
                  <label>Город:</label>
                  <input
                    type="text"
                    value={selectedSupplier.city || ""}
                    onChange={e => setSelectedSupplier({ ...selectedSupplier, city: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>

                {/* MobilePhone */}
                <div>
                  <label>Телефон*:</label>
                  <input
                    type="text"
                    value={selectedSupplier.mobilePhone || ""}
                    onChange={e => setSelectedSupplier({ ...selectedSupplier, mobilePhone: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                    placeholder="+7 (999) 123-45-67"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label>Email*:</label>
                  <input
                    type="email"
                    value={selectedSupplier.email || ""}
                    onChange={e => setSelectedSupplier({ ...selectedSupplier, email: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                    placeholder="example@mail.com"
                    required
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
                {!selectedSupplier.isNew && (
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
                  onClick={() => setSelectedSupplier(null)}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )
      }
    </Layout>
  );
}