import React, { useEffect, useState } from "react";
import { useUsersApi } from "../api/users";
import Layout from "../Layout/Layout";

const roles = ["accountant", "admin", "product_manager", "worker"];

const AdminPanel = () => {
  const { fetchUsers, updateUser, deleteUser, createUser } = useUsersApi();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Редактирование
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ username: "", role: "", password: "" });

  // Добавление нового пользователя
  const [adding, setAdding] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", role: "accountant", password: "" });

  // -------------------------
  // Загрузка пользователей
  // -------------------------
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      alert("Ошибка при загрузке пользователей: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // -------------------------
  // Редактирование
  // -------------------------
  const startEdit = (user) => {
    setEditingId(user.id);
    setForm({ username: user.username, role: user.role, password: "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ username: "", role: "", password: "" });
  };

  const saveEdit = async (id) => {
    try {
      await updateUser(id, form);
      await loadUsers();
      cancelEdit();
    } catch (err) {
      alert("Ошибка при сохранении: " + err.message);
    }
  };

  // -------------------------
  // Удаление пользователя
  // -------------------------
  const handleDelete = async (id, role) => {
    if (role === "admin" && users.filter(u => u.role === "admin").length === 1) {
      alert("Нельзя удалить последнего администратора!");
      return;
    }
    if (!confirm("Вы уверены, что хотите удалить пользователя?")) return;

    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      alert("Ошибка при удалении: " + err.message);
    }
  };

  // -------------------------
  // Добавление пользователя
  // -------------------------
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) {
      alert("Username и Password обязательны");
      return;
    }

    try {
      await createUser(newUser);
      setNewUser({ username: "", role: "accountant", password: "" });
      setAdding(false);
      await loadUsers();
    } catch (err) {
      alert("Ошибка при добавлении пользователя: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Админ-панель</h1>

        {/* ---------------- Добавление пользователя ---------------- */}
        <div className="mb-6">
          {!adding ? (
            <button
              onClick={() => setAdding(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
            >
              Добавить пользователя
            </button>
          ) : (
            <div className="p-4 bg-gray-50 border rounded grid grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  className="border px-2 py-1 w-full"
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Role</label>
                <select
                  className="border px-2 py-1 w-full"
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="border px-2 py-1 w-full"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="col-span-3 mt-2 space-x-2">
                <button
                  onClick={handleAddUser}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-800"
                >
                  Создать
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---------------- Таблица пользователей ---------------- */}
        {loading ? (
          <div className="text-center text-gray-500 mt-12">Загрузка...</div>
        ) : (
          <table className="min-w-full table-auto bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Username</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Password</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{user.id}</td>
                  <td className="px-4 py-2 border">
                    {editingId === user.id ? (
                      <input
                        type="text"
                        className="border px-2 py-1 w-full"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                      />
                    ) : (
                      user.username
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editingId === user.id ? (
                      <select
                        className="border px-2 py-1 w-full"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                      >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editingId === user.id ? (
                      <input
                        type="password"
                        className="border px-2 py-1 w-full"
                        placeholder="New password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                    ) : (
                      "********"
                    )}
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    {editingId === user.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(user.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(user)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.role)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800"
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default AdminPanel;