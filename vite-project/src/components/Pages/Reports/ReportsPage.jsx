import React, { useState } from "react";
import Layout from "../../Layout/Layout";
import GrossProfitByProductReport from "./GrossProfitReport";
import TurnoverReport from "./TurnoverReport";
import CustomerInteractionReport from "./CustomerInteractionReport";
import SupplierInteractionReport from "./SupplierInteractionReport";

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState(null);

  if (activeReport === "gross") {
    return <GrossProfitByProductReport onBack={() => setActiveReport(null)} />;
  }
  if (activeReport === "turnover") {
    return <TurnoverReport onBack={() => setActiveReport(null)} />;
  }
  if (activeReport === "customer") {
    return <CustomerInteractionReport onBack={() => setActiveReport(null)} />;
  }
  if (activeReport === "supplier") {
    return <SupplierInteractionReport onBack={() => setActiveReport(null)} />;
  }

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Отчёты</h1>

        <div className="space-y-4">
          <button
            onClick={() => setActiveReport("gross")}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-800"
          >
            Валовая прибыль
          </button>

          <button
            onClick={() => setActiveReport("turnover")}
            className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-800"
          >
            Оборачиваемость товара
          </button>

          <button
            onClick={() => setActiveReport("customer")}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-800"
          >
            Взаимодействие с клиентами
          </button>

          <button
            onClick={() => setActiveReport("supplier")}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded hover:bg-orange-800"
          >
            Взаимодействие с поставщиками
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;