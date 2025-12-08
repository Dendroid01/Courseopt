import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./components/Pages/Dashboard";
import Deliveries from "./components/Pages/Deliveries";
import Orders from "./components/Pages/Orders";
import Products from "./components/Pages/Products";
import Customers from "./components/Pages/Customers";
import Suppliers from "./components/Pages/Suppliers";
import AdminPanel from "./components/Pages/AdminPanel";
import ReportsPage from "./components/Pages/Reports/ReportsPage";
import Login from "./Auth/Login";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./Auth/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Публичная страница */}
          <Route path="/login" element={<Login />} />

          {/* Дашборд — доступ для всех авторизованных */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={["admin", "accountant", "product_manager", "worker"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Поставки */}
          <Route
            path="/deliveries"
            element={
              <PrivateRoute roles={["admin", "accountant", "product_manager", "worker"]}>
                <Deliveries />
              </PrivateRoute>
            }
          />

          {/* Заказы */}
          <Route
            path="/orders"
            element={
              <PrivateRoute roles={["admin", "accountant", "product_manager", "worker"]}>
                <Orders />
              </PrivateRoute>
            }
          />

          {/* Склад */}
          <Route
            path="/products"
            element={
              <PrivateRoute roles={["admin", "product_manager"]}>
                <Products />
              </PrivateRoute>
            }
          />

          {/* Клиенты */}
          <Route
            path="/customers"
            element={
              <PrivateRoute roles={["admin", "product_manager"]}>
                <Customers />
              </PrivateRoute>
            }
          />

          {/* Поставщики */}
          <Route
            path="/suppliers"
            element={
              <PrivateRoute roles={["admin", "product_manager"]}>
                <Suppliers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute roles={["admin", "accountant"]}>
                <ReportsPage />
              </PrivateRoute>
            }
          />

          {/* Редирект с корня на дашборд */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;