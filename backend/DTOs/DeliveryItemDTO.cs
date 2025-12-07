using System;

namespace Courseopt.DTOs;

public class DeliveryItemDto
{
    public string ProductBarcode { get; set; } = null!;
    public string ProductName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public DateOnly? ProductionDate { get; set; }
    public DateOnly? ExpirationDate { get; set; }
}