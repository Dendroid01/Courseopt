import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./components/Pages/Dashboard";
import Deliveries from "./components/Pages/Deliveries";
import Orders from "./components/Pages/Orders";
import Products from "./components/Pages/Products";
import Customers from "./components/Pages/Customers";
import Suppliers from "./components/Pages/Suppliers";
import Login from "./Auth/Login";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./Auth/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/deliveries"
            element={
              <PrivateRoute roles={["admin", "product_manager"]}>
                <Deliveries />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute roles={["admin", "product_manager", "worker"]}>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/products"
            element={
              <PrivateRoute roles={["admin", "product_manager"]}>
                <Products />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <PrivateRoute roles={["admin", "product_manager"]}>
                <Customers />
              </PrivateRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <PrivateRoute roles={["admin", "product_manager"]}>
                <Suppliers />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;