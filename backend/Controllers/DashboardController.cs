using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Courseopt.Models;
using Courseopt.DTOs;
using Courseopt.Enums;

namespace Courseopt.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly FoodWarehouseContext _context;

    public DashboardController(FoodWarehouseContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> GetDashboard()
    {
        var dto = new DashboardDto
        {
            ProductsCount = await _context.Products.CountAsync(),
            OrdersCount = await _context.Orders.CountAsync(),
            DeliveriesCount = await _context.Deliveries.CountAsync(),
            CustomersCount = await _context.Customers.CountAsync(),
            SuppliersCount = await _context.Suppliers.CountAsync(),

            RecentDeliveries = await _context.Deliveries
                .OrderByDescending(d => d.DeliveryDate)
                .Take(5)
                .Select(d => new DeliveryDto
                {
                    Id = d.Id,
                    SupplierInn = d.SupplierInn,
                    SupplierName = d.SupplierInnNavigation.CompanyName,
                    DeliveryDate = d.DeliveryDate,
                    TotalAmount = d.TotalAmount,
                    Status = d.Status
                }).ToListAsync(),

            RecentOrders = await _context.Orders
                .OrderByDescending(o => o.OrderDate)
                .ThenBy(o => o.CustomerInnNavigation.CompanyName)
                .Take(5)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    CustomerInn = o.CustomerInn,
                    CustomerName = o.CustomerInnNavigation.CompanyName,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status
                }).ToListAsync()
        };

        return Ok(dto);
    }
}
