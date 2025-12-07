namespace Courseopt.DTOs;

public class OrderItemDto
{
    public string ProductBarcode { get; set; } = null!;
    public string ProductName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal? MarkupPercent { get; set; }
    public decimal? PriceAtOrder { get; set; }
    public decimal? FinalPrice { get; set; }
}
