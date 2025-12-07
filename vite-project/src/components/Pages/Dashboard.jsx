import React, { useEffect, useState } from "react";
import Layout from "../Layout/Layout.jsx";
import Card from "../Dashboard/Card.jsx";
import RecentDeliveries from "../Dashboard/RecentDeliveries.jsx";
import RecentOrders from "../Dashboard/RecentOrders.jsx";
import { fetchDashboard } from "../api/dashboard.js";
import { fetchOrder, updateOrder, deleteOrder, createOrder, deleteOrderItem } from "../api/orders.js";
import { fetchCustomers } from "../api/customers";
import { fetchProducts } from "../api/product";
import OrderModal from "../Modals/OrderModal.jsx";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saving, setSaving] = useState(false);

  // -------------------------
  // Загрузка данных дашборда, клиентов и товаров
  // -------------------------
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchDashboard();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await fetchCustomers();
      setClients(data);
    } catch (err) {
      console.error("Ошибка при загрузке клиентов:", err.message);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Ошибка при загрузке товаров:", err.message);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadClients();
    loadProducts();
  }, []);

  // -------------------------
  // Установка заказа с актуальными остатками
  // -------------------------
  const setSelectedOrderWithStock = (order) => {
    if (!order) return;
    const updatedItems = order.items.map(item => {
      const foundProduct = products.find(
        p => p.name.toLowerCase() === item.productName.toLowerCase()
      );
      return {
        ...item,
        stock: foundProduct?.currentStock ?? 0,
        suggestions: []
      };
    });
    setSelectedOrder({ ...order, items: updatedItems });
  };

  // -------------------------
  // Работа с модалкой
  // -------------------------
  const handleClickOrder = async (order) => {
    try {
      const fullOrder = await fetchOrder(order.id);
      setSelectedOrderWithStock(fullOrder);
    } catch (err) {
      alert("Ошибка при загрузке заказа: " + err.message);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      productBarcode: "",
      productName: "",
      quantity: 1,
      markupPercent: 0,
      priceAtOrder: 0,
      finalPrice: 0,
      stock: 0,
      suggestions: []
    };
    setSelectedOrder({
      ...selectedOrder,
      items: [...selectedOrder.items, newItem]
    });
  };

  const handleChangeItem = (index, field, value) => {
    const newItems = [...selectedOrder.items];
    let newValue = value;

    if (field === "quantity") {
      const productName = newItems[index].productName;
      const found = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
      if (found && value > (found.currentStock ?? 0)) {
        newValue = found.currentStock ?? 0;
        alert(`Максимальное доступное количество: ${found.currentStock}`);
      }
    }

    newItems[index][field] = newValue;

    const item = newItems[index];
    if (["quantity", "markupPercent", "priceAtOrder"].includes(field)) {
      const price = item.priceAtOrder ?? 0;
      const qty = item.quantity ?? 1;
      const markup = item.markupPercent ?? 0;
      item.finalPrice = price * qty * (1 + markup / 100);
    }

    setSelectedOrder({ ...selectedOrder, items: newItems });
  };

  const handleProductSearch = (idx, text) => {
    const updated = [...selectedOrder.items];
    updated[idx].productName = text;
    updated[idx].suggestions = text
      ? products.filter(p => p.name.toLowerCase().includes(text.toLowerCase()))
      : [];
    setSelectedOrder({ ...selectedOrder, items: updated });
  };

  const handleSelectProduct = (idx, product) => {
    const updated = [...selectedOrder.items];
    updated[idx] = {
      ...updated[idx],
      productBarcode: product.barcode,
      productName: product.name,
      priceAtOrder: product.unitPrice ?? 0,
      markupPercent: 0,
      finalPrice: product.unitPrice ?? 0,
      stock: product.currentStock ?? 0,
      suggestions: []
    };
    setSelectedOrder({ ...selectedOrder, items: updated });
  };

  const handleChangeOrderField = (field, value) => {
    setSelectedOrder(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const updatedOrder =
        selectedOrder.id === 0
          ? await createOrder(selectedOrder)
          : await updateOrder(selectedOrder.id, selectedOrder);

      // Обновляем остатки после сохранения
      const updatedWithStock = {
        ...updatedOrder,
        items: updatedOrder.items.map(item => {
          const foundProduct = products.find(p => p.barcode === item.productBarcode);
          return { ...item, stock: foundProduct?.currentStock ?? 0, suggestions: [] };
        })
      };

      setSelectedOrder(null);
      await loadDashboard();
    } catch (err) {
      alert("Ошибка при сохранении: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    if (!confirm("Вы уверены, что хотите удалить заказ?")) return;

    setSaving(true);
    try {
      await deleteOrder(selectedOrder.id);
      setSelectedOrder(null);
      await loadDashboard();
    } catch (err) {
      alert("Ошибка при удалении: " + err.message);
    } finally {
      setSaving(false);
    }
  };

    const handleDeleteItem = async (barcode) => {
      if (!selectedOrder) return;
      if (!confirm("Удалить позицию заказа?")) return;
  
      setSaving(true);
  
      try {
        await deleteOrderItem(selectedOrder.id, barcode);
  
        // Удаляем локально
        setSelectedOrder({
          ...selectedOrder,
          items: selectedOrder.items.filter(i => i.productBarcode !== barcode)
        });
  
        // Обновляем список заказов (с уже пересчитанной суммой)
        await loadDashboard();
  
      } catch (err) {
        alert("Ошибка при удалении позиции: " + err.message);
      } finally {
        setSaving(false);
      }
    };
  
  if (loading) return <Layout><div className="text-center text-gray-500 mt-12">Загрузка...</div></Layout>;
  if (error) return <Layout><div className="text-center text-red-500 mt-12">Ошибка: {error}</div></Layout>;

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card title="Продукты" count={data.productsCount} />
          <Card title="Заказы" count={data.ordersCount} />
          <Card title="Поставки" count={data.deliveriesCount} />
          <Card title="Клиенты" count={data.customersCount} />
          <Card title="Поставщики" count={data.suppliersCount} />
        </div>

        <RecentDeliveries deliveries={data.recentDeliveries || []} />
        <RecentOrders orders={data.recentOrders || []} onClickOrder={handleClickOrder} />

        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            clients={clients}
            products={products}
            onClose={() => setSelectedOrder(null)}
            onSave={handleSave}
            onDelete={handleDelete}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onChangeItem={handleChangeItem}
            onSearchProduct={handleProductSearch}
            onSelectProduct={handleSelectProduct}
            onChangeOrderField={handleChangeOrderField}
            saving={saving}
          />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;