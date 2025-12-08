import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const links = [
    { path: "/dashboard", label: "Дашборд" },
    { path: "/deliveries", label: "Поставки" },
    { path: "/orders", label: "Заказы" },
    { path: "/products", label: "Склад" },
    { path: "/customers", label: "Клиенты" },
    { path: "/suppliers", label: "Поставщики" },
  ];

  const activeClass = "bg-blue-100 text-blue-800 font-semibold";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow w-full relative h-16">
      {/* Навигация по центру */}
      <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-2">
        {links.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded cursor-pointer hover:bg-blue-50 ${
                isActive ? activeClass : "text-gray-700"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Пользователь и выход справа */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
        {user && <span className="text-gray-700 font-medium">{user.username}</span>}
        <button
          onClick={handleLogout}
          className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-900"
        >
          Выйти
        </button>
      </div>
    </header>
  );
}