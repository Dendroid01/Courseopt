import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./components/Pages/Dashboard";
import Deliveries from "./components/Pages/Deliveries";
import Orders from "./components/Pages/Orders";
import Products from "./components/Pages/Products";
import Customers from "./components/Pages/Customers";
import Suppliers from "./components/Pages/Suppliers";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/suppliers" element={<Suppliers />} />
      </Routes>
    </Router>
  );
}

export default App;
