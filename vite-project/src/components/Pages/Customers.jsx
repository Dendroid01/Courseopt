import { useEffect, useState, useMemo } from "react";
import Layout from "../Layout/Layout";
import { useCustomersApi } from "../api/customers";

export default function Customers() {
  const {fetchCustomers, createCustomer, updateCustomer, deleteCustomer} = useCustomersApi();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
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
        items.filter(c => c.companyName.toLowerCase().includes(text.toLowerCase()))
      );
    }
  };

  const handleSelectCompany = (name) => {
    setFilterCompany(name);
    setCompanySuggestions([]);
  };

  const cities = useMemo(() => [...new Set(items.map(c => c.city).filter(Boolean))], [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (filterCompany) result = result.filter(c => c.companyName.toLowerCase().includes(filterCompany.toLowerCase()));
    if (filterCity) result = result.filter(c => c.city === filterCity);

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
    if (!selectedCustomer?.inn) {
      alert("ИНН обязателен");
      return;
    }

    setSaving(true);
    try {
      if (selectedCustomer.isNew) {
        await createCustomer(selectedCustomer);
      } else {
        await updateCustomer(selectedCustomer.inn, selectedCustomer);
      }
      await loadCustomers();
      setSelectedCustomer(null);
    } catch (err) {
      alert("Ошибка при сохранении: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer?.inn) return;
    if (!confirm("Удалить клиента?")) return;
    setSaving(true);
    try {
      await deleteCustomer(selectedCustomer.inn);
      await loadCustomers();
      setSelectedCustomer(null);
    } catch (err) {
      alert("Ошибка при удалении: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Клиенты</h1>

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
              {companySuggestions.map(c => (
                <div
                  key={c.inn}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-left"
                  onClick={() => handleSelectCompany(c.companyName)}
                >
                  {c.companyName}
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
          onClick={() => setSelectedCustomer({
            inn: "",
            companyName: "",
            contactPerson: "",
            bik: "",
            correspondentAccount: "",
            settlementAccount: "",
            region: "",
            city: "",
            street: "",
            mobilePhone: "",
            email: "",
            isNew: true
          })}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          + Создать клиента
        </button>
        <button onClick={resetFilters} className="bg-gray-300 px-3 py-1 rounded">
          Сбросить фильтры
        </button>

        {/* Кнопка создать */}


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
              {filteredItems.map(c => (
                <tr
                  key={c.inn}
                  className="text-center hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedCustomer(c)}
                >
                  <td className="py-2 px-4 border">{c.inn}</td>
                  <td className="py-2 px-4 border">{c.companyName}</td>
                  <td className="py-2 px-4 border">{c.city}</td>
                  <td className="py-2 px-4 border">{c.mobilePhone}</td>
                  <td className="py-2 px-4 border">{c.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }

      {/* Модалка */}
      {
        selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative max-h-[80vh] overflow-auto">
              <button className="absolute top-2 right-2" onClick={() => setSelectedCustomer(null)}>✕</button>
              <h2 className="text-xl font-bold mb-4">{selectedCustomer.isNew ? "Создать" : "Редактировать"} клиента</h2>

              <div className="flex flex-col gap-2">
                {/* INN */}
                <div>
                  <label>ИНН*:</label>
                  <input
                    type="text"
                    value={selectedCustomer.inn}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setSelectedCustomer({ ...selectedCustomer, inn: val });
                    }}
                    className="border rounded px-2 py-1 w-full"
                    disabled={!selectedCustomer.isNew}
                    required
                  />
                </div>

                {/* CompanyName */}
                <div>
                  <label>Компания*:</label>
                  <input
                    type="text"
                    value={selectedCustomer.companyName}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, companyName: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                    required
                  />
                </div>

                {/* ContactPerson */}
                <div>
                  <label>Контактное лицо:</label>
                  <input
                    type="text"
                    value={selectedCustomer.contactPerson || ""}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, contactPerson: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>

                {/* Bik */}
                <div>
                  <label>БИК:</label>
                  <input
                    type="text"
                    value={selectedCustomer.bik || ""}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, bik: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>

                {/* CorrespondentAccount */}
                <div>
                  <label>Кор. счет:</label>
                  <input
                    type="text"
                    value={selectedCustomer.correspondentAccount || ""}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, correspondentAccount: e.target.value.replace(/\D/g, '').slice(0, 20) })}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>

                {/* SettlementAccount */}
                <div>
                  <label>Расчетный счет:</label>
                  <input
                    type="text"
                    value={selectedCustomer.settlementAccount || ""}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, settlementAccount: e.target.value.replace(/\D/g, '').slice(0, 20) })}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>

                {/* Region */}
                <div>
                  <label>Регион:</label>
                  <input
                    type="text"
                    value={selectedCustomer.region || ""}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, region: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>

                {/* City */}
                <div>
                  <label>Город:</label>
                  <input
                    type="text"
                    value={selectedCustomer.city || ""}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, city: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>

                {/* Street */}
                <div>
                  <label>Улица:</label>
                  <input
                    type="text"
                    value={selectedCustomer.street || ""}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, street: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>

                {/* MobilePhone */}
                <div>
                  <label>Телефон*:</label>
                  <input
                    type="text"
                    value={selectedCustomer.mobilePhone || ""}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, mobilePhone: e.target.value })}
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
                    value={selectedCustomer.email || ""}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
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
                {!selectedCustomer.isNew && (
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
                  onClick={() => setSelectedCustomer(null)}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )
      }
    </Layout >
  );
}