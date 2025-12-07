namespace Courseopt.DTOs;
public class DashboardDto
{
    public int ProductsCount { get; set; }
    public int OrdersCount { get; set; }
    public int DeliveriesCount { get; set; }
    public int CustomersCount { get; set; }
    public int SuppliersCount { get; set; }

    public List<DeliveryDto> RecentDeliveries { get; set; } = new List<DeliveryDto>();
    public List<OrderDto> RecentOrders { get; set; } = new List<OrderDto>();
}
