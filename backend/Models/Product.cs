using System;
using System.Collections.Generic;
using Courseopt.Enums;

namespace Courseopt.Models;

public partial class Product
{
    public string Barcode { get; set; } = null!;

    public ProductCategory Category { get; set; }
    public string Name { get; set; } = null!;

    public ProductUnit Unit { get; set; }

    public decimal? UnitPrice { get; set; }

    public int? StorageDays { get; set; }

    public virtual ICollection<DeliveryItem> DeliveryItems { get; set; } = new List<DeliveryItem>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
