import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Header() {
  const { user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Добавляем roles к каждой ссылке
  const links = [
    { path: "/dashboard", label: "Дашборд", roles: ["admin", "accountant", "product_manager","worker"]},
    { path: "/deliveries", label: "Поставки", roles: ["admin", "accountant", "product_manager","worker"] },
    { path: "/orders", label: "Заказы", roles: ["admin", "accountant", "product_manager","worker"]  },
    { path: "/products", label: "Склад", roles: ["admin", "product_manager"]  },
    { path: "/customers", label: "Клиенты", roles: ["admin", "product_manager"] },
    { path: "/suppliers", label: "Поставщики", roles: ["admin", "product_manager"]  },
    { path: "/admin", label: "Админ", roles: ["admin"] },
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
        {links.map(link => {
          if (link.path === "/admin" && role !== "admin") return null;
          
          const hasAccess = !link.roles || link.roles.includes(role);

          return (
            <NavLink
              key={link.path}
              to={hasAccess ? link.path : "#"} // если нет доступа, ссылка не кликабельна
              className={({ isActive }) =>
                `px-4 py-2 rounded cursor-pointer hover:bg-blue-50 ${
                  isActive ? activeClass : "text-gray-700"
                } ${!hasAccess ? "opacity-50 cursor-not-allowed" : ""}`
              }
              onClick={e => !hasAccess && e.preventDefault()} // блокируем переход
            >
              {link.label}
            </NavLink>
          );
        })}
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