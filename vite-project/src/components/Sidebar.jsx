import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `block px-4 py-2 rounded hover:bg-gray-200 ${
      pathname === path ? "bg-gray-300 font-semibold" : ""
    }`;

  return (
    <div className="w-56 h-screen bg-gray-100 border-r p-4">
      <h2 className="text-xl font-bold mb-6">Меню</h2>

      <nav className="flex flex-col gap-2">
        <Link className={linkClass("/dashboard")} to="/dashboard">Дашборд</Link>
        <Link className={linkClass("/deliveries")} to="/deliveries">Поставки</Link>
        <Link className={linkClass("/orders")} to="/orders">Заказы</Link>
        <Link className={linkClass("/products")} to="/products">Склад</Link>
        <Link className={linkClass("/customers")} to="/customers">Клиенты</Link>
        <Link className={linkClass("/suppliers")} to="/suppliers">Поставщики</Link>
      </nav>
    </div>
  );
}