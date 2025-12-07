import { NavLink } from "react-router-dom";

export default function Header() {
  const links = [
    { path: "/dashboard", label: "Дашборд" },
    { path: "/deliveries", label: "Поставки" },
    { path: "/orders", label: "Заказы" },
    { path: "/products", label: "Склад" },
    { path: "/customers", label: "Клиенты" },
    { path: "/suppliers", label: "Поставщики" },
  ];

  const activeClass = "bg-blue-100 text-blue-600 font-semibold";

  return (
    <header className="bg-white shadow w-full">
      <div className="flex justify-center">
        <nav className="flex w-full max-w-[1200px]">
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex-1 text-center py-3 border-r last:border-r-0 cursor-pointer hover:bg-blue-50 ${
                  isActive ? activeClass : "text-gray-700"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
